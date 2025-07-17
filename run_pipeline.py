#!/usr/bin/env python3

import os
import sys

# Change to the project directory
project_dir = '/Users/manthena08/personal-work/docujourney'
os.chdir(project_dir)

# Add scripts to Python path
sys.path.insert(0, os.path.join(project_dir, 'scripts'))

# Run the pipeline
if __name__ == "__main__":
    print("🚀 Starting Enhanced Data Pipeline for 2024...")
    print(f"Working directory: {os.getcwd()}")
    
    # Import and run the pipeline
    try:
        from data_pipeline import run_pipeline
        
        success = run_pipeline(
            year_folder="2024",
            specific_files=None,
            upload_to_bigquery=True
        )
        
        if success:
            print("✅ Pipeline completed successfully!")
        else:
            print("❌ Pipeline failed!")
            
    except Exception as e:
        print(f"❌ Error running pipeline: {e}")
        import traceback
        traceback.print_exc()