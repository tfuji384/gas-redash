import { Interface } from "readline";
function create(baseUrl: string, apiKey: string) {
    return new Client(baseUrl, apiKey);
}

interface Job {
    id: number;
    status: JobStatus;
    query_result_id: number;
    updated_at: string;
    error: string;
}

enum JobStatus {
    PENDING = 1,
    STARTED = 2,
    SUCCESS = 3,
    FAILURE = 4,
    REVOKED = 4
}

class Client {
    baseUrl: string;
    apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    /**
    * @param {number} queryId
    */
    getQueryResult(queryId: number) {
        const endpoint: string = `queries/${queryId}/results.json`;
        const url = this.buildUrl(endpoint);
        return this.get(url)['query_result']['data']['rows'];
    }

    getQueryResultAsCSV(queryId: number) {
        const endpoint: string = `queries/${queryId}/results.csv`;
        const url = this.buildUrl(endpoint);
        return this.get(url);
    }

    /**
    * @param {number} queryId
    */
    getFreshQueryResult(queryId: number, csv = false) {
        const response = this.refresh(queryId);
        const job = response.job;
        this.pollingJob(job);
        if (csv) {
            return this.getQueryResultAsCSV(queryId);
        }
        return this.getQueryResult(queryId);
    }

    refresh(queryId: number) {
        const endpoint = `queries/${queryId}/refresh`;
        const url = this.buildUrl(endpoint);
        return this.post(url);
    }

    pollingJob(job: Job) {
        const endpoint = `jobs/${job.id}`;
        const url = this.buildUrl(endpoint);
        let count = 0;
        while (job.status != 3 && job.status != 4 && count < 100) {
            let response = this.get(url);
            let job = response.job;
            Utilities.sleep(100);
            count++;
        }
        if (job.status == JobStatus.SUCCESS) {
            return job.query_result_id;
        }
        throw Error('failed to refrest Query!');
    }

    private post(url: string) {
        const options = { method: 'post', headers: { 'Authorization': this.apiKey } };
        return this.request(url, options);
    }

    private get(url: string) {
        const options = { headers: { 'Authorization': this.apiKey } };
        return this.request(url, options);
    }

    private request(url: string, options: {}) {
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    }

    private buildUrl(endpoint: String): string {
        return `${this.baseUrl}/api/${endpoint}`
    }
}
