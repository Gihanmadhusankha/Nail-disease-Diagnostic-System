import os
import secrets

import cv2
from ultralytics import YOLO


CLASS_LABELS = [
    'Acral Lentiginous Melanoma',
    'Beaus Line',
    'Blue Finger',
    'Clubbing',
    'Healthy Nail',
    'Onychogryphosis',
    'Pitting',
]


def load_model(model_path: str):
    return YOLO(model_path)


def allowed_file(filename: str, allowed_extensions: set[str]) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def draw_boxes(results, image_path: str, result_folder: str):
    image = cv2.imread(image_path)
    predictions = []

    for result in results:
        if hasattr(result, 'boxes') and result.boxes:
            for box in result.boxes.data:
                class_id = int(box[5])
                confidence = round(float(box[4]) * 100, 2)
                x1, y1, x2, y2 = map(int, box[:4])
                label = CLASS_LABELS[class_id] if 0 <= class_id < len(CLASS_LABELS) else 'Unknown'

                predictions.append({
                    'label': label,
                    'confidence': confidence,
                })

                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 165, 255), 2)

                label_text = f'{label} {confidence:.2f}%'
                (text_width, text_height), _ = cv2.getTextSize(
                    label_text,
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    2,
                )
                label_top = max(0, y1 - text_height - 10)
                label_bottom = y1 if y1 - text_height - 10 >= 0 else min(image.shape[0], y1 + text_height + 10)

                cv2.rectangle(
                    image,
                    (x1, label_top),
                    (x1 + text_width + 8, label_bottom),
                    (0, 165, 255),
                    -1,
                )

                text_y = y1 - 6 if y1 - text_height - 10 >= 0 else y1 + text_height + 4
                cv2.putText(
                    image,
                    label_text,
                    (x1 + 4, text_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 0, 0),
                    2,
                )

    result_filename = f"{secrets.token_hex(8)}.jpg"
    result_path = os.path.join(result_folder, result_filename)
    cv2.imwrite(result_path, image)
    return predictions, result_filename
