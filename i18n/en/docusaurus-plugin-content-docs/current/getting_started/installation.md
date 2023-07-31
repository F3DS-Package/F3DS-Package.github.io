---
sidebar_position: 1
---

# Installation

## Requisites

1. Operation system: Linux (Recommended is Ubuntu version 20.04 LTS or above.)
2. Compiler: gfortran or ifort

## Compilation & Installation

First, you need to clone the repository and download submodules.

```:shell
git clone https://github.com/F3DS-Package/F3DS-Package.git
cd F3DS-Package
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
