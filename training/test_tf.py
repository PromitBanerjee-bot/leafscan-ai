import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '1'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

for p in [
    r'C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.2\bin',
    r'C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.2\libnvvp',
]:
    if os.path.isdir(p):
        os.add_dll_directory(p)

import tensorflow as tf

print('TF :', tf.__version__)
print('GPU:', tf.config.list_physical_devices('GPU'))