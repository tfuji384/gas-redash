# gas-redash

GASからRedashのAPIを叩くライブラリが欲しかったけどなかったので作った

## usage

- 「リソース」→「ライブラリ」で`MfAwSVqSIr9QVogJmlH5fyL8R-QPYxpAf`を入力

## サンプルコード

```.gs
function myFunction() {
    const client = redash.create(REDASH_BASE_URL, PERSONAL_ACCESS_KEY);
    const res = client.getRefreshedQueryResult(QUERY_ID);
    Logger.log(res);
}
```
