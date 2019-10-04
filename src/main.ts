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
    fetchQueryResult(queryId: number) {
        const endpoint: string = `queries/${queryId}/results.json`;
        const url = this.buildUrl(endpoint);
        return this._get(url)['query_result']['data']['rows'];
    }

    fetchQueryResultAsCSV(queryId: number) {
        const endpoint: string = `queries/${queryId}/results.csv`;
        const url = this.buildUrl(endpoint);
        return this._get(url);
    }

    /**
    * @param {number} queryId
    */
    fetchRefreshedQueryResult(queryId: number, csv = false) {
        const response = this.refresh(queryId);
        const job = response.job;
        this.pollingJob(job);
        if (csv) {
            return this.fetchQueryResultAsCSV(queryId);
        }
        return this.fetchQueryResult(queryId);
    }

    refresh(queryId: number) {
        const endpoint = `queries/${queryId}/refresh`;
        const url = this.buildUrl(endpoint);
        return this._post(url);
    }

    pollingJob(job: Job) {
        const endpoint = `jobs/${job.id}`;
        const url = this.buildUrl(endpoint);
        let count = 0;
        while (job.status != 3 && job.status != 4 && count < 100) {
            let response = this._get(url);
            let job = response.job;
            Utilities.sleep(100);
            count++;
        }
        if (job.status == JobStatus.SUCCESS) {
            return job.query_result_id;
        }
        throw Error('failed to refrest Query!');
    }

    private _post(url: string) {
        const options = { method: 'post', headers: { 'Authorization': this.apiKey } };
        return this._request(url, options);
    }

    private _get(url: string) {
        const options = { headers: { 'Authorization': this.apiKey } };
        return this._request(url, options);
    }

    private _request(url: string, options: {}) {
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    }

    private buildUrl(endpoint: String): string {
        return `${this.baseUrl}/api/${endpoint}`;
    }
}
