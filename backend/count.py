import os
from pathlib import Path

import matplotlib.pyplot as plt
import yaml


yaml_path = Path(__file__).resolve().parent / 'dataset' / 'dataset.yaml'
with yaml_path.open('r', encoding='utf-8') as f:
    data = yaml.safe_load(f)


raw_names = data.get('names', [])
if isinstance(raw_names, dict):
    class_names = {int(class_id): name for class_id, name in raw_names.items()}
elif isinstance(raw_names, list):
    class_names = {index: name for index, name in enumerate(raw_names)}
else:
    raise ValueError("Unsupported 'names' format in dataset.yaml. Expected list or dict.")


dataset_root = yaml_path.parent
train_path = str(data.get('train', 'images/train'))
train_path_parts = Path(train_path).parts
if 'images' in train_path_parts:
    labels_parts = ['labels' if part == 'images' else part for part in train_path_parts]
    labels_path = dataset_root.joinpath(*labels_parts)
else:
    labels_path = dataset_root / 'labels' / 'train'

counts = {name: 0 for name in class_names.values()}

if labels_path.exists():
    for label_file in os.listdir(labels_path):
        if label_file.endswith('.txt'):
            with open(os.path.join(labels_path, label_file), 'r', encoding='utf-8') as f:
                for line in f:
                    class_id = int(line.split()[0])
                    class_name = class_names.get(class_id)
                    if class_name is not None:
                        counts[class_name] += 1
else:
    raise FileNotFoundError(f'Labels folder not found: {labels_path}')


plt.figure(figsize=(10, 6))
plt.bar(counts.keys(), counts.values(), color='skyblue')
plt.xlabel('Nail Disease Classes')
plt.ylabel('Number of Instances')
plt.title('Dataset Distribution')
plt.xticks(rotation=45)
plt.show()

print(f" {counts}")