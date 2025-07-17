#!/usr/bin/env python3

import sys
import os
sys.path.append('scripts')

from pathlib import Path

# Test file discovery functionality
BASE_DATA_PATH = '/Users/manthena08/personal-work/docujourney/scripts/data'

def discover_files(year_folder):
    """Discover LCA and Employer files in the specified year folder"""
    base_path = Path(BASE_DATA_PATH) / year_folder
    if not base_path.exists():
        print(f"Error: Folder {base_path} does not exist")
        return [], []
    
    # Find LCA files (usually contain 'LCA_Disclosure')
    lca_files = list(base_path.glob('*LCA*.xlsx')) + list(base_path.glob('*LCA*.csv'))
    
    # Find Employer files (usually contain 'Employer')
    employer_files = list(base_path.glob('*Employer*.xlsx')) + list(base_path.glob('*Employer*.csv'))
    
    return lca_files, employer_files

# Test the discovery
print("🔍 Testing Enhanced Data Pipeline...")
print("\nAvailable data folders:")
data_path = Path(BASE_DATA_PATH)

for folder in data_path.iterdir():
    if folder.is_dir():
        print(f"  📁 {folder.name}")
        lca_files, employer_files = discover_files(folder.name)
        for lca_file in lca_files:
            print(f"    📄 LCA: {lca_file.name}")
        for emp_file in employer_files:
            print(f"    📄 EMP: {emp_file.name}")

print("\n✅ Enhanced pipeline file discovery successful!")
print("\nTo process 2024 data, run:")
print("python3 scripts/data_pipeline.py --year-folder 2024")