# Drug Data Import

This directory contains the animal drug data and import scripts for NotiVet.

## Files

- **AnimalDrugs.csv**: USDA-sourced animal drug data containing 916 approved veterinary drugs
- **import-drugs.ts**: TypeScript script to import CSV data into the database

## Data Source

The `AnimalDrugs.csv` file contains data from the USDA Animal and Plant Health Inspection Service (APHIS) and includes:

- Product codes and establishment information
- Animal species (Canine, Feline, Bovine, Equine, Avian, etc.)
- Manufacturer details
- Active ingredients
- Trade names and distributors

## Database Schema Updates

The following fields were added to the Drug model to accommodate the CSV data:

```prisma
model Drug {
  // ... existing fields ...
  
  // New fields from CSV data
  productCode       String?   // Product Code from USDA
  establishmentCode String?   // Establishment Code
  subsidiaries      String?   // Subsidiaries information
  tradeName         String?   // Trade Name(s)
  distributors      String?   // Distributor(s)
}
```

## Import Process

### Species Mapping

The CSV species are mapped to our standardized enum values:

- `Canine` → `CANINE`
- `Feline` → `FELINE`
- `Bovine` → `BOVINE`
- `Equine` → `EQUINE`
- `Swine` → `PORCINE`
- `Chicken`, `Turkey`, `Duck` → `AVIAN`
- `Fish`, `Rabbit`, `Ferret` → `EXOTIC`
- etc.

### Data Cleaning

The import script handles:
- HTML tag removal from CSV fields
- Product code extraction from HTML links
- Species normalization and mapping
- Multiple trade name handling
- Default delivery method assignment

## Usage

### Manual Import

```bash
npm run db:import-drugs
```

### Automatic Import (via seed)

The seed script (`npm run db:seed`) will automatically import drugs if:
1. The CSV file exists in `data/AnimalDrugs.csv`
2. The database has only the basic seed drugs (≤3 drugs)

### Statistics

After import, the database contains:

- **918 total drugs** (3 seed + 915 from CSV)
- **Top species**: Avian (265), Bovine (183), Canine (126), Porcine (116)
- **Top manufacturers**: Boehringer Ingelheim (236), Zoetis (153), Intervet (125)

## API Integration

The existing drug APIs automatically work with the new data:

- `/api/drugs` - Search and filter drugs
- Drug search includes new fields (productCode, tradeName, etc.)
- Species filtering works with mapped values
- All existing functionality is preserved

## Regenerating Data

To reimport the drugs (e.g., after schema changes):

1. Clear existing drugs: `DELETE FROM drugs WHERE productCode IS NOT NULL;`
2. Run import: `npm run db:import-drugs`

Or reset the entire database:

1. `rm prisma/dev.db`
2. `npm run db:push`
3. `npm run db:seed`