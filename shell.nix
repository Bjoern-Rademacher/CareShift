{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = [
    pkgs.nodejs_24
    pkgs.pnpm
    pkgs.openssl
    pkgs.prisma-engines_7
  ];

  # Use the Nix-compatible engine instead of downloading one.
  PRISMA_SCHEMA_ENGINE_BINARY =
    "${pkgs.prisma-engines_7}/bin/schema-engine";
}
