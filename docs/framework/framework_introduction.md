---
sidebar_position: 1
---

# Introduction

- F3DS Frameworkは任意の方程式を離散化し、流体力学ソルバーを開発するためのフレームワークです
- ユーザーは物理モデルの離散化と以下を行えば、シミュレーションを実行可能です
    - 各セルの物理量やパラメータ等を保存する配列の定義
    - 変数の座標系変換
    - 使用するスキームやメソッドの宣言
    - ソルバーの実行手順の記述
    - （場合によっては）フラックス計算手順の記述
- 並列化等コンピューターリソースに関する管理、スキームやI/O等メソッドの実装と実行はフレームワーク側で行います
- 実例はとして、[F3DS Collection](https://github.com/F3DS-Package/F3DS-Package/tree/main/collection)のコードを見ることもおすすめします。以降のコーディング解説を見るより、素早く理解できるユーザもいるかもしれません。

# Framework taste

ここでは、Frameworkの使用方法を学びます。例題として、保存量$\phi$の移流方程式、

$$ \frac{d\phi}{dt} + \nabla\cdot\textit{\textbf{f}} = 0 $$

を有限体積法で解くことを考えます。ここで、$\textit{\textbf{f}} = \textit{\textbf{c}}\phi$は流束、$\textit{\textbf{c}}$は速度です。この式は体積$\textit{V}$の微小セルによる体積分で積分系へ変換でき、

$$ \frac{\partial}{\partial t}\int_{V}\phi\textit{dV} + \int_{V}\nabla\cdot\textit{\textbf{f}}\textit{dV} = 0 $$

と表せます。さらに、Gaussの発散定理によって、

$$ \frac{\partial}{\partial t}\int_{V}\phi\textit{dV} + \int_{S}(\textit{\textbf{f}}\cdot\textit{\textbf{n}})\textit{dS} = 0 $$

と面積分に変換できます。ここで、$\textit{S}$は面積、$\textit{\textbf{n}}$は面に対する単位法線ベクトルです。この式を微小セル$\textit{i}$に適用すれば、

$$ \frac{\partial}{\partial t}\phi_\textit{i}\textit{V}_\textit{i} + \sum_{\textit{j}\in\mathbb{F}_\textit{i}}(\textit{\textbf{f}}_\textit{j}\cdot\textit{\textbf{n}}_\textit{j})\textit{S}_\textit{j} = 0 $$

と空間項を離散化することができます。ここで、$\mathbb{F}_\textit{i}$はセル$\textit{i}$が持つ面の集合を示します。最後に、時間項の残差$\textit{R}_\textit{i}$を使い、

$$ \textit{R}(\phi_\textit{i}) = - \frac{1}{\textit{V}_\textit{i}}\sum_{\textit{j}\in\mathbb{F}_\textit{i}}(\textit{\textbf{f}}_\textit{j}\cdot\textit{\textbf{n}}_\textit{j})\textit{S}_\textit{j} $$

$$ \frac{\partial}{\partial t}\phi_\textit{i} = \textit{R}(\phi_\textit{i}) $$

と書き改めます。時間項に関しては、例えば、2次精度TVDルンゲクッタ法を用いて、

$$ \phi_\textit{i,t}^* = \phi_\textit{i,t} + \Delta\textit{t}\textit{R}(\phi_\textit{i,t}) $$

$$ \phi_{\textit{i},\textit{t}+\Delta\textit{t}} = \frac{1}{2}\phi_\textit{i,t} + \frac{1}{2}(\phi_\textit{i,t}^*  + \Delta\textit{t}\textit{R}(\phi_\textit{i,t}^*)) $$

と離散化し、2段階で解くことができます。これをプログラムとして実装すると、以下のような手順になります。

1. $\textit{t}\leftarrow 0$
1. 計算設定の読み込む
2. 計算格子の読み込む
3. 初期条件の読み込む
4. 終了判定条件を満たすまで5~9を繰り返す
5. --（必要であれば）時間$\textit{t}$における計算結果を出力する
6. --時間離散化法の各段について7~8を行う
7. ----残差$\textit{R}_\textit{i}$を計算する
8. ----各段の保存量$\phi_\textit{i}$（例えば、$\phi_\textit{i,t}^*$、または、$\phi_{\textit{i},\textit{t}+\Delta\textit{t}}$）を計算する
9. --時間を更新する（$\textit{t}\leftarrow\textit{t}+\Delta\textit{t}$）
10. 時間$\textit{t}$における計算結果を出力する

上記の手順をF3DS Frameworkで実装します。