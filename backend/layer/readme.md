## 当ディレクトリについて
lambdaデプロイ時に開発環境とlambdaとの環境の差異のせいでエラーとなっている可能性があった為、
環境差異をなくす目的で、lambda pythonのdockerイメージを利用してライブラリのlayer化を行えるように用意した。

### layer zip化
docker build -t lambda-layer .
docker create --name temp lambda-layer
docker cp temp:layer.zip .
docker rm temp
