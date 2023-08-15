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

ここでは、フレームワークの使用方法を学びます。例題として、保存量$\phi$の移流方程式、

$$
\frac{\partial\phi}{\partial t} + \nabla\cdot\textit{\textbf{f}} = 0
$$

を有限体積法で解くことを考えます。ここで、$\textit{\textbf{f}} = \textit{\textbf{c}}\phi$は流束、$\textit{\textbf{c}}$は速度です。この式は体積分で積分系へ変換でき、

$$
\frac{\partial}{\partial t}\int_{V}\phi\textit{dV} + \int_{V}\nabla\cdot\textit{\textbf{f}}\textit{dV} = 0
$$

と表せます。さらに、Gaussの発散定理によって、

$$
\frac{\partial}{\partial t}\int_{V}\phi\textit{dV} + \int_{S}(\textit{\textbf{f}}\cdot\textit{\textbf{n}})\textit{dS} = 0
$$

と面積分に変換できます。ここで、$\textit{S}$は面積、$\textit{\textbf{n}}$は面に対する単位法線ベクトルです。この式を微小セル$\textit{i}$に適用すれば、

$$
\frac{\partial}{\partial t}\phi_\textit{i}\textit{V}_\textit{i} + \sum_{\textit{j}\in\mathbb{F}_\textit{i}}(\textit{\textbf{f}}_\textit{j}\cdot\textit{\textbf{n}}_\textit{j})\textit{S}_\textit{j} = 0
$$

と空間項を離散化することができます。ここで、$\mathbb{F}_\textit{i}$はセル$\textit{i}$が持つ面の集合を示します。最後に、時間項の残差$\textit{R}_\textit{i}$を使い、

$$
\textit{R}(\phi_\textit{i}) = - \frac{1}{\textit{V}_\textit{i}}\sum_{\textit{j}\in\mathbb{F}_\textit{i}}(\textit{\textbf{f}}_\textit{j}\cdot\textit{\textbf{n}}_\textit{j})\textit{S}_\textit{j}
$$

$$
\frac{\partial}{\partial t}\phi_\textit{i} = \textit{R}(\phi_\textit{i})
$$

と書き改めます。時間項に関しては、例えば、2次精度TVDルンゲクッタ法を用いて、

$$
\phi_\textit{i,t}^* = \phi_\textit{i,t} + \Delta\textit{t}\textit{R}(\phi_\textit{i,t})
$$

$$
\phi_{\textit{i},\textit{t}+\Delta\textit{t}} = \frac{1}{2}\phi_\textit{i,t} + \frac{1}{2}(\phi_\textit{i,t}^*  + \Delta\textit{t}\textit{R}(\phi_\textit{i,t}^*))
$$

と離散化し、2段階で解くことができます。これをプログラムとして実装すると、以下のような手順になります。

1. $\textit{t}\leftarrow 0$
1. 計算設定の読み込む
2. 計算格子の読み込む
3. 初期条件の読み込む
4. 終了判定条件を満たすまで5~10を繰り返す
5. --（必要であれば）時間$\textit{t}$における計算結果を出力する
6. --時間離散化法の各段について7~9を行う
7. ----境界条件の処理を行う
8. ----残差$\textit{R}_\textit{i}$を計算する
9. ----各段の保存量$\phi_\textit{i}$（例えば、$\phi_\textit{i,t}^*$、または、$\phi_{\textit{i},\textit{t}+\Delta\textit{t}}$）を計算する
10. --時間を更新する（$\textit{t}\leftarrow\textit{t}+\Delta\textit{t}$）
11. 時間$\textit{t}$における計算結果を出力する

上記の手順をF3DS Frameworkで実装すると、FortranのProgram文は以下のようになります。

```fortran
program advection_equation_solver
    use typedef_module
    use class_cellsystem
    use class_legacy_grid_parser
    use class_legacy_init_parser
    use class_vtk_result_writer
    use class_end_time_criterion
    use class_constant_time_increment_controller
    use class_json_configuration
    use class_second_order_tvd_rk
    use class_midpoint_interpolator
    use advection_equation_module

    implicit none

    integer(int_kind), parameter :: num_conservative_variables = 1

    real(real_kind), allocatable :: conservative_variables_set   (:)
    real(real_kind), allocatable :: flux_set                  (:, :)
    real(real_kind), allocatable :: residual_set                 (:)

    type(cellsystem                        ) :: a_cellsystem
    type(legacy_grid_parser                ) :: a_grid_parser
    type(legacy_init_parser                ) :: a_init_parser
    type(json_configuration                ) :: a_configuration
    type(midpoint_interpolator             ) :: an_interpolator
    type(second_order_tvd_rk               ) :: a_time_stepper
    type(vtk_result_writer                 ) :: a_result_writer
    type(end_time_criterion                ) :: a_termination_criterion
    type(constant_time_increment_controller) :: a_time_increment_controller

    integer(int_kind) :: stage_num

    call a_configuration%parse("config.json")

    call initialize_model(a_configuration)

    call a_cellsystem%initialize(a_configuration)

    call a_cellsystem%read(a_grid_parser, a_configuration)

    call a_cellsystem%initialize(conservative_variables_set   )
    call a_cellsystem%initialize(flux_set                  , 3)
    call a_cellsystem%initialize(residual_set                 )

    call a_cellsystem%initialize(an_interpolator            , a_configuration, num_conservative_variables)
    call a_cellsystem%initialize(a_time_stepper             , a_configuration, num_conservative_variables)
    call a_cellsystem%initialize(a_result_writer            , a_configuration, num_conservative_variables)
    call a_cellsystem%initialize(a_termination_criterion    , a_configuration, num_conservative_variables)
    call a_cellsystem%initialize(a_time_increment_controller, a_configuration, num_conservative_variables)

    call a_cellsystem%read_initial_condition(a_init_parser, a_configuration, conservative_variables_set)

    do while ( .not. a_cellsystem%satisfy_termination_criterion(a_termination_criterion) )
        call a_cellsystem%update_time_increment(a_time_increment_controller, conservative_variables_set, spectral_radius)

        if ( a_cellsystem%is_writable(a_result_writer) ) then
            call write_result(a_cellsystem, a_result_writer, conservative_variables_set)
        end if

        call a_cellsystem%show_timestepping_infomation()

        call a_cellsystem%prepare_time_stepping(a_time_stepper, conservative_variables_set, residual_set)

        do stage_num = 1, a_cellsystem%get_number_of_stages(a_time_stepper), 1
            call a_cellsystem%operate_cellwise(flux_set, conservative_variables_set, flux_calculation_operator)

            call a_cellsystem%apply_boundary_condition(                  &
                flux_set                                               , &
                flux_lenght                                            , &
                rotate_flux                                            , &
                unrotate_flux                                          , &
                empty_condition_function        = empty_bc             , &
                symmetric_condition_function    = symmetric_bc           &
            )

            call a_cellsystem%compute_divergence(an_interpolator, flux_set, residual_set)

            call a_cellsystem%compute_next_stage(a_time_stepper, stage_num, conservative_variables_set, residual_set)
        end do

        call a_cellsystem%increment_time()
    end do

    if ( a_cellsystem%is_writable(a_result_writer) ) then
        call write_result(a_cellsystem, a_result_writer, conservative_variables_set)
    end if

    call a_result_writer%cleanup()
end program
```

各処理で使用する関数は、`module advection_equation_module`にまとめています。

```fortran
module advection_equation_module
    use typedef_module
    use vector_module
    use stdio_module
    use class_cellsystem
    use abstract_configuration
    use abstract_result_writer

    implicit none
    private

    real(real_kind) :: speed(3)

    public :: initialize_model
    public :: write_result
    public :: spectral_radius
    public :: flux_calculation_operator
    public :: rotate_flux
    public :: unrotate_flux
    public :: empty_bc
    public :: symmetric_bc

contains

    subroutine initialize_model(a_configuration)
        class(configuration) :: a_configuration

        logical :: found

        call a_configuration%get_real  ( "Model.Speed.x", speed(1), found)
        if(.not. found) call call_error("'Model.Speed.x' is not found in the configuration file you set.")
        call a_configuration%get_real  ( "Model.Speed.y", speed(2), found)
        if(.not. found) call call_error("'Model.Speed.y' is not found in the configuration file you set.")
        call a_configuration%get_real  ( "Model.Speed.z", speed(3), found)
        if(.not. found) call call_error("'Model.Speed.z' is not found in the configuration file you set.")
    end subroutine initialize_model

    subroutine write_result(a_cellsystem, a_result_writer, conservative_variables_set)
        type (cellsystem       ), intent(inout) :: a_cellsystem
        class(result_writer    ), intent(inout) :: a_result_writer
        real (real_kind        ), intent(inout) :: conservative_variables_set   (:)
        call a_cellsystem%open_file   (a_result_writer)
        call a_cellsystem%write_scolar(a_result_writer, "Phi", conservative_variables_set)
        call a_cellsystem%close_file  (a_result_writer)
    end subroutine

    pure function spectral_radius(variable, length) result(r)
        real   (real_kind), intent(in) :: variable
        real   (real_kind), intent(in) :: length
        real   (real_kind) :: r
        r = vector_magnitude(speed(:))
    end function

    subroutine flux_calculation_operator(flux, phi)
        real(real_kind), intent(inout) :: flux(:)
        real(real_kind), intent(in   ) :: phi
        flux(:) = -1.0_real_kind * speed(:) * phi
    end subroutine

    pure function rotate_flux(      &
        global_coodinate_flux     , &
        face_normal_vector        , &
        face_tangential1_vector   , &
        face_tangential2_vector   , &
        num_flux_variables                ) result(face_coordinate_flux)

        real   (real_kind     ), intent(in)  :: global_coodinate_flux   (:)
        real   (real_kind     ), intent(in)  :: face_normal_vector      (3)
        real   (real_kind     ), intent(in)  :: face_tangential1_vector (3)
        real   (real_kind     ), intent(in)  :: face_tangential2_vector (3)
        integer(int_kind      ), intent(in)  :: num_flux_variables
        real   (real_kind     )              :: face_coordinate_flux    (num_flux_variables)

        face_coordinate_flux(1:3) = vector_rotate(global_coodinate_flux(1:3), face_normal_vector, face_tangential1_vector, face_tangential2_vector)
    end function rotate_flux

    pure function unrotate_flux(    &
        face_coordinate_flux      , &
        face_normal_vector        , &
        face_tangential1_vector   , &
        face_tangential2_vector   , &
        num_flux_variables                ) result(global_coordinate_flux)

        real   (real_kind     ), intent(in)  :: face_coordinate_flux    (:)
        real   (real_kind     ), intent(in)  :: face_normal_vector      (3)
        real   (real_kind     ), intent(in)  :: face_tangential1_vector (3)
        real   (real_kind     ), intent(in)  :: face_tangential2_vector (3)
        integer(int_kind      ), intent(in)  :: num_flux_variables
        real   (real_kind     )              :: global_coordinate_flux   (num_flux_variables)

        global_coordinate_flux(1:3) = vector_unrotate(face_coordinate_flux(1:3), face_normal_vector, face_tangential1_vector, face_tangential2_vector)
    end function unrotate_flux

    pure function empty_bc(inner_cell_flux, num_flux_variavles) result(ghost_cell_flux)
        real   (real_kind), intent(in) :: inner_cell_flux(:)
        integer(int_kind ), intent(in) :: num_flux_variavles
        real   (real_kind)             :: ghost_cell_flux(num_flux_variavles)
        ghost_cell_flux(1) =  1.0_real_kind * inner_cell_flux(1)
        ghost_cell_flux(2) =  1.0_real_kind * inner_cell_flux(2)
        ghost_cell_flux(3) =  1.0_real_kind * inner_cell_flux(3)
    end function

    pure function symmetric_bc(inner_cell_flux, num_flux_variavles) result(ghost_cell_flux)
        real   (real_kind), intent(in) :: inner_cell_flux(:)
        integer(int_kind ), intent(in) :: num_flux_variavles
        real   (real_kind)             :: ghost_cell_flux(num_flux_variavles)
        ghost_cell_flux(1) = -1.0_real_kind * inner_cell_flux(1)
        ghost_cell_flux(2) =  1.0_real_kind * inner_cell_flux(2)
        ghost_cell_flux(3) =  1.0_real_kind * inner_cell_flux(3)
    end function
end module
```

Program文の先頭で、

```fortran
    use typedef_module
    use class_cellsystem
    use class_legacy_grid_parser
    use class_legacy_init_parser
    use class_vtk_result_writer
    use class_end_time_criterion
    use class_constant_time_increment_controller
    use class_json_configuration
    use class_second_order_tvd_rk
    use class_midpoint_interpolator
```

と使用するモジュールを宣言します。ここで、`typedef_module`は型種別を定義するモジュールです。F3DS Frameworkでは、`typedef_module`の型種別を利用し、

- `real(real_kind) :: real_val`
- `integer(int_kind) :: int_val`

と変数宣言することを推奨します。`class_cellsystem`は計算格子を保持・管理するためのクラスを格納したモジュール、`class_legacy_grid_parser`、`class_legacy_init_parser`はF3DS Legacy Formatで記述された格子及び初期条件を読み込むクラスモジュール、`class_vtk_result_writer`はVTKフォーマットのリザルトファイルを書きこむためのクラスモジュール、`class_end_time_criterion`は終了判定条件のクラスモジュール、`class_constant_time_increment_controller`は定数時間刻みを行うためのクラスモジュール、`class_json_configuration`はJSONフォーマットの設定ファイルを読み込むためのクラスモジュールです。また、本計算ではTVD RK2で時間進行するため、`class_second_order_tvd_rk`と、面でのフラックス$\textit{\textbf{f}}_\textit{j}$を計算するために中点補完法`class_midpoint_interpolator`をuse宣言しています。
使用可能なクラスモジュールに関しては、[F3DS Frameworkのディレクトリ](https://github.com/F3DS-Package/F3DS-Package/tree/main/framework/src)から確認できます。
これらのクラスモジュールに格納されたクラスは、以下のようにインスタンス化します。

```fortran
    type(cellsystem                        ) :: a_cellsystem
    type(legacy_grid_parser                ) :: a_grid_parser
    type(legacy_init_parser                ) :: a_init_parser
    type(json_configuration                ) :: a_configuration
    type(midpoint_interpolator             ) :: an_interpolator
    type(second_order_tvd_rk               ) :: a_time_stepper
    type(vtk_result_writer                 ) :: a_result_writer
    type(end_time_criterion                ) :: a_termination_criterion
    type(constant_time_increment_controller) :: a_time_increment_controller
```