{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.fastapi
    pkgs.python311Packages.uvicorn
    pkgs.python311Packages.websockets
    pkgs.python311Packages.requests
    pkgs.nodePackages.npm
    pkgs.nodePackages.expo-cli
  ];
  
  env = {
    PYTHON_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc.lib
      pkgs.zlib
      pkgs.glib
      pkgs.xorg.libX11
      pkgs.xorg.libXext
      pkgs.xorg.libXtst
      pkgs.xorg.libXi
      pkgs.xorg.libXrandr
      pkgs.freetype
      pkgs.fontconfig
      pkgs.cairo
      pkgs.pango
      pkgs.atk
      pkgs.gdk-pixbuf
      pkgs.gtk3
    ];
    
    PYTHONHOME = "${pkgs.python311}";
    PYTHONPATH = "${pkgs.python311}/lib/python3.11/site-packages";
    
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc.lib
      pkgs.zlib
    ];
  };
}