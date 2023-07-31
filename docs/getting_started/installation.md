---
sidebar_position: 1
---

# インストール

## リクエスト

1. Operation system: Linux (Version 20.04 LTSまたはそれ以上のUbuntuを推奨)
2. Compiler: gfortran or ifort

## コンパイル & インストール

最初にリポジトリを`git clone`でダウンロードします。その後、`git submodule init`及び`git submodule update`でサードパーティライブラリのダウンロードを行ってください。

```:shell
git clone https://github.com/F3DS-Package/F3DS-Package.git
cd F3DS-Package
git submodule init
git submodule update
```

F3DS Packageは現在Linuxシステムのみサポートしています。コンパイルは`make`により行います。

```:shell
make
```

デフォルトコンパイラは`gfortran`が指定されています。また、コンパイルオプションはリリースオプション（-O3、-march=native等、デバッグ時ではなく、実計算時に有益なオプション郡）が指定されています。
もし、"ifort"及びデバッグオプションを利用したい場合は以下のオプションを付与します。

```:shell
make COMPILER=ifort DEBUG=yes
```

オプションリスト等、makefileの詳細な仕様は`make help`コマンドにより確認できます。
最後に、以下のコマンドでインストールを行います。

```:shell
make install
```
デフォルトのインストールディレクトリは`/opt/f3ds-package`が指定されています。インストールパスは`PLEFIX={path}`オプションで変更可能です。
インストール時に作成される`setenv.sh`により、F3DS packageのパスを環境変数へ追加可能です。
以下のスクリプトを`bashrc`または`profile`に追加することを推奨します。

```
source /opt/f3ds-package/setenv.sh
```
