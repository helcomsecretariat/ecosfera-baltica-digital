# Asset Storage and Naming Conventions

This document provides guidelines on where to store original game assets, their processing destinations, and the naming conventions to use.

## Asset Storage

### Original Assets Directory

- **Location**: `./src/assets/`
- **Purpose**: Store all original images and graphical assets that will be used in the game. This includes formats like `.webp`, `.png`, `.jpg`, `.jpeg`, and `.svg`.
- **Role**: This is the primary directory where all unprocessed or master copies of game assets are kept before any optimization takes place.
- **Convertion**: use this command when add/change assets:
  ```bash
  npm run optimize-images
  ```

### Processed Assets Directory

- **Location**: `./public/...`
- **Purpose**: This directory is intended for storing all processed and optimized assets, primarily in the `.avif` format. These are optimized for performance and used directly in the application.
- **Role**: This directory is created automatically by the application and should not be manually created or modified. Ideally it should be empty and created during CI/CD pipeline. But not yet.

## Asset Naming Conventions

Consistent naming conventions are crucial for asset management and retrieval in the game. The convention includes:

1. **Prefix**:

   - **Usage**: All asset paths start with an `assets_prefix` that is defined in the deck configuration JSON.
   - **Example**: If the deck configuration specifies `"assets_prefix": "ecosfera_baltica"`, then all assets are expected to be stored in the `./src/assets/ecosfera_baltica` directory. During optimization (`npm run optimize-images`), the assets will be copied to the `./public/ecosfera_baltica` directory and accessable via the `/ecosfera_baltica/...` path.

2. **Category Specific Naming**:

   - The prefix for entities like `animal` and `plant` assets is `entity_`.
   - Other categories use their explicit names without alteration (`element_`,`dsisaster_`...).

3. **File Name Formatting**:
   - Convert all file names to lowercase.
   - Replace spaces with underscores to ensure compatibility and standardization.
