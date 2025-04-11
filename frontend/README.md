## 静的解析ツール

- ESLint

## 整形ツール

- Prettier<br>
  ローカルではvscodeの設定を入れ、保存時に自動的に整形されるようにした。方法は参考記事参照。

#### 参考記事

https://zenn.dev/big_tanukiudon/articles/c1ab3dba7ba111

## 単体テスト

Jest + React Testing Libraryで実施する。<br>
設定方法は下記のNext.js公式ページ参照。

### Next.jsでJestの設定をする

https://nextjs.org/docs/pages/building-your-application/testing/jest

### Jestカバレッジ

Stmtsは、C0(statement coverage)を表す指標
Branchは、C1(branch coverage)を表す指標
Funcsは、定義関数を呼び出してるかどうかの指標
Linesは、Stmtsで代替でき、後方互換性のための残った指標
