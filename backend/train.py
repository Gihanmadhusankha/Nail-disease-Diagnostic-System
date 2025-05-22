import torch
from ultralytics import YOLO  

def train_yolo_model():
    # Check if CUDA (GPU) is available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")  

    # Load YOLOv11 model (Ensure yolov11n.pt exists or provide correct path)
    model = YOLO('F:/projects/final_project_YOLO V-11/yolo11m.pt').to(device)  

    # Train the model
    model.train(
        data='F:/projects/final_project_YOLO V-11/dataset/dataset.yaml',  # Path to dataset YAML
        epochs=50,                 # Number of training epochs
        batch=4,                  # Batch size
        imgsz=416,                 # Image size
        project='model/trained_weights',  # Folder to save weights
        name='nail_disease_model',  # Name of the experiment
        device=device,             # Ensure training runs on GPU if available
        amp=True
    )

if __name__ == '__main__':
    train_yolo_model()
