---
sidebar_position: 1
---

# Introduction

- F3DS Packageは有限体積法（及び関連手法）による流体解析のためのModern Fortranソフトウェアパッケージです。
    - このパッケージは以下のソフトウェアで構成されています。
        - F3DS Framework: 流体力学ソルバーを開発するためのModern Fortranフレームワーク
        - F3DS Resource: モデルや、方程式系に依存したスキームを格納したライブラリ
        - F3DS Collection: F3DS FrameworkとResourceで開発したF3DS Package公式のソルバー

- F3DS Packageは柔軟です。
    - 非構造/構造格子ともに利用可能です。使用する格子の変更に伴って再コンパイルする必要はありません。どのソルバーも非構造/構造格子の両方を使えるように設計されています。
    - 非構造用のスキームだけでなく、構造格子用の高次精度スキームが準備されています。
    - 時間進行法や勾配計算法等のスキームだけではなく、メッシュI/OやVTK等の計算結果I/Oが備わっています。
    - オブジェクト指向設計が採用されており、ユーザーがスキームやコンポーネントを開発してF3DS Framework内で利用することができます。（F3DS Frameworkに備わっているスキームやコンポーネントを利用しソルバーを開発するだけであれば、オブジェクト指向をあまり意識することなくコーディングできます。）

- F3DS Packageは並列計算に対応します。
    - 現在はOpen MPによるmulti thread計算にのみ対応していますが、将来的にMPIやGPGPUに対応することを目指しています。

- F3DS PackageはOpen source softwareです。
    - MITライセンスで配布されています。
    - 本ソフトウェアの利用を宣言・引用すれば、本ソフトウェアを用いた研究だけでなく、ソフトウェアの改造、再配布を認めます。
    - 本ソフトウェアへのコントリビュート・提案を歓迎します。

# Getting Started

- インストール方法はこちら: [Getting started](https://f3ds-package.github.io/docs/getting_started)
- F3DS Frameworkで利用可能なスキームやF3DS Collectionで配布されているソルバーのリストは、[リポジトリ](https://github.com/F3DS-Package/F3DS-Package/tree/main)を御覧ください。
