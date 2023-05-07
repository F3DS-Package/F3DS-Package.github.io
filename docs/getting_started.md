---
sidebar_position: 1
---

# Getting Started

## How to compile & setup

First, you need to clone the repository and download submodules.

```:shell
git clone https://github.com/F3DS-Package/F3DS-Package.git
git submodule init
git submodule update
```

F3DS only support for Linux system now. You can compile F3DS by Makefile like this.

```:shell
make
```

Default compiler is set "gfortran" with a release build options.  
If you want to use "ifort" and debug options, you can use the following command.

```:shell
make COMPILER=ifort DEBUG=yes
```

More details can be found in the script shown by the 'make help' command.  
Finally, to install F3DS Package for your computer, run the bellow:

```:shell
make install
```
The default installation path is '/opt/f3ds-package'. You can change the installation path by the 'PLEFIX={path}' option.   
Executing the script 'setenv.sh', you can easily set the environment variables of F3DS package.
We recommend writing the following script to your bashrc or profile.

```
source /{your_f3ds_package_path}/setenv.sh
```

### Use F3DS Framework and F3DS Resource

Please link static link libraries and mod files.

```
gfortran your_solver.f90 -o your_solver.exe -LF3DS_LIBS -IF3DS_MODS f3ds_framework.a
```

### Use solvers

All binaries provided by F3DS collection are stored in "bins" directory. If you set the environment variables using "setenv.sh", binaries are already set to your environment.
More information can be found in README.md in each collection directory.
