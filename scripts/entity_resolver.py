
import pandas as pd

def load_canonical_map(map_file_path):
    """Loads the canonical employer mapping from a CSV file."""
    try:
        return pd.read_csv(map_file_path).set_index('variation')['canonical_name'].to_dict()
    except FileNotFoundError:
        print(f"Error: Canonical map file not found at {map_file_path}")
        return {}
    except Exception as e:
        print(f"Error loading canonical map from {map_file_path}: {e}")
        return {}

def resolve_employer_names(df, map_file_path):
    """Resolves employer names to their canonical forms using a map and algorithmic cleaning."""
    canonical_map = load_canonical_map(map_file_path)

    def clean_and_resolve(name):
        # Convert to string and handle NaN values before cleaning
        cleaned_name = str(name).upper().replace('.', '').replace(',', '').replace('INC', '').replace('LLC', '').strip()
        if cleaned_name == 'NAN': # Handle pandas NaN converted to string
            return ''
        # Add more common suffixes to remove as needed

        # Resolve using canonical map
        return canonical_map.get(cleaned_name, cleaned_name) # Return cleaned_name if not in map

    if 'employerpetitionername' in df.columns:
        df['employerpetitionername'] = df['employerpetitionername'].apply(clean_and_resolve)
    return df
