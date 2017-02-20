# Install Module Dependencies

This addresses a very specific problem when maintaining D8 sites in a particular
way for deployment on Pantheon. It adds non-module module dependencies to the
site `vendor` during build.

## Usage:

`install_module_dependencies --root=/tmp/build --moduledir=/tmp/build/modules`
