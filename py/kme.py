import os
import sys

import matplotlib.pyplot as plt
import pandas as pd
from lifelines import KaplanMeierFitter
from lifelines.datasets import load_dd
from lifelines.statistics import logrank_test


def plot_two_groups(data, t_col_name, e_col_name, g_name, alpha):
    '''
    functino to render the 2 groups and calculate the p values
    '''
    T = data[t_col_name]
    E = data[e_col_name]

    groups = df[g_name]

    # get unique groups to get 1st and 2nd groups names
    uniques = df[g_name].unique()

    ix = (groups == uniques[0])

    kmf = KaplanMeierFitter()
    # plot first group
    kmf.fit(T[~ix], E[~ix], label=uniques[1])
    ax = kmf.plot()

    # plot second group
    kmf.fit(T[ix], E[ix], label=uniques[0])
    kmf.plot(ax=ax)
    # get resoults for p Values
    results = logrank_test(T[ix], T[~ix], E[ix], E[~ix], alpha=alpha)
    plt.title(
        'p-value: {0:.4f}, alpha: {1:.2f}'.format(results.p_value, alpha))


def plot_one_groupd(data, t_col_name, e_col_name, label):
    '''
    plost the KM for one group with given lable
    '''
    T = data[t_col_name]
    E = data[e_col_name]
    kmf = KaplanMeierFitter()
    kmf.fit(T, event_observed=E, label=label)
    kmf.plot()


def read_arguments():
    """
        Validates the arguments and raise the exception
        Returns the file_name, time column name, 
        event column name, group column name and alpha
    """
    if len(sys.argv) == 1:
        raise BaseException('error - missing data file path in arguments')
    # not we have only 1 argument
    file_name = sys.argv[1]

    if file_name is None:
        raise BaseException('error - missing data file path in arguments')

    if len(file_name) == 0:
        raise BaseException('error missing data file path in arguments')

    if not os.path.exists(file_name):
        raise BaseException('error - data file `' +
                            file_name+'` not found not exists')

    # the aplha argument could be optional
    alpha = .95
    if len(sys.argv) == 3:
        try:
            alpha = float(sys.argv[2])
            if (alpha <= 0) & (alpha > 1):
                raise BaseException(
                    'error - alpha not within the range 0< '+alpha+' <=1')

        except:
            pass
    # these constant values could be read
    # from the arguments
    return file_name, 'T', 'E', 'group', alpha


if __name__ == '__main__':
    try:
        # read arguments
        file_name, time_col, event_col, groups_column, alpha = read_arguments()
        # read the data
        df = pd.read_csv(file_name, sep='\t')

        # get the unique columns
        uniques = df[groups_column].unique()

        # decide what to plot
        if len(uniques) == 1:
            plot_one_groupd(df, time_col, event_col, uniques[0])
        elif len(uniques) == 2:
            plot_two_groups(df, time_col, event_col, groups_column, alpha)
        else:
            # as sample of demonstratoin to raise
            # the error driven by the data
            raise 'Model don\'t suport more then 2 groups'

        # have the png file
        name = os.path.split(file_name)[1].split('.')[0]
        plt.savefig('../src/public/kme/'+name)
        print('ok')

    except Exception as ex:
        # print error
        print(ex)
        print('error')
    sys.stdout.flush()
