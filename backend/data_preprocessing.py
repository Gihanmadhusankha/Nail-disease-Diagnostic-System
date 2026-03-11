import cv2
import os
import numpy as np

def data_pipeline(input_folder, target_size=(416, 416), blur_threshold=100):
    """
    Complete Pipeline: Cleaning -> Outlier Removal -> Pre-processing -> Augmentation
    """
    for filename in os.listdir(input_folder):
        img_path = os.path.join(input_folder, filename)
        img = cv2.imread(img_path)
        
        # --- 1. DATA CLEANING (Removing corrupted files) ---
        if img is None:
            print(f"Removing corrupted image: {filename}")
            # os.remove(img_path)
            continue

        # --- 2. OUTLIER REMOVAL (Filtering blurry images) ---
        # We use the Laplacian Variance to check the focus of the image
        variance = cv2.Laplacian(img, cv2.CV_64F).var()
        if variance < blur_threshold:
            print(f"Skipping blurry outlier: {filename} (Variance: {variance:.2f})")
            continue

        # --- 3. STANDARDIZATION (Resizing) ---
        # YOLOv11 requires a consistent input size 
        img_res = cv2.resize(img, target_size)

        # --- 4. PRE-PROCESSING (Color Conversion & Normalization) ---
        # Convert BGR (OpenCV default) to RGB (YOLO default)
        img_rgb = cv2.cvtColor(img_res, cv2.COLOR_BGR2RGB)
        
        # Scaling pixel values to [0, 1] for faster convergence
        img_normalized = img_rgb / 255.0

        # --- 5. DATA AUGMENTATION (Example: Balancing minority classes) ---
        # Flipping and adjusting brightness to handle class imbalance
        img_flipped = cv2.flip(img_res, 1) # Horizontal flip
        img_bright = cv2.convertScaleAbs(img_res, alpha=1.2, beta=30) # Brightness

        print(f"Successfully processed: {filename}")

