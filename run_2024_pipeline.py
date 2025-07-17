#!/usr/bin/env python3

import sys
import os
from pathlib import Path

# Add scripts directory to path
sys.path.append('scripts')

from data_pipeline import main

# Set command line arguments for 2024 processing
sys.argv = [
    'data_pipeline.py',
    '--year-folder',
    '2024'
]

if __name__ == "__main__":
    print("🚀 Starting Enhanced Data Pipeline for 2024 data...")
    try:
        main()
        print("✅ Pipeline completed successfully!")
    except Exception as e:
        print(f"❌ Pipeline failed: {e}")
        import traceback
        traceback.print_exc()