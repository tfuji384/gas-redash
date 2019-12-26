# gas-redash

GASからRedashのAPIを叩くライブラリが欲しかったけどなかったので作った

## usage

- 「リソース」→「ライブラリ」で`MfAwSVqSIr9QVogJmlH5fyL8R-QPYxpAf`を入力

## サンプルコード

```.js
function myFunction() {
    const client = redash.create(REDASH_BASE_URL, PERSONAL_ACCESS_KEY);
    const res = client.fetchRefreshedQueryResult(QUERY_ID);
    Logger.log(res);
}
```
