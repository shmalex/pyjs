from lifelines.datasets import load_dd
from lifelines import KaplanMeierFitter

import os
import sys
import pandas as pd
import matplotlib.pyplot as plt


try:
    file_name = sys.argv[1]

    data = pd.read_csv(file_name, sep='\t')
    kmf = KaplanMeierFitter()

    T = data["duration"]
    E = data["observed"]

    kmf.fit(T, event_observed=E)
    ax = kmf.plot()
    name = os.path.split(file_name)[1].split('.')[0]
    plt.savefig('../src/public/kme/'+name)
    print('ok')
except Exception as ex:
    print(ex)
    print('error')
sys.stdout.flush()
