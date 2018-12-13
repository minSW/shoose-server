# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
import csv
import pymysql.cursors
import sys

# Mysql
host = "localhost"
port = 22
user = "shoose"
password = "shoose"
db = "shoose"

new_user = int(sys.argv[1])

conn = pymysql.connect(host=host, user=user, password=password, db=db, charset='utf8')
cur = conn.cursor()
query = "select * from product"# where SN=%d" % new_user
#print(query)
#query = "select * from preference"
cur.execute(query)
rows = np.array(cur.fetchall())


#File read
#data = pd.read_csv("./shoes.CSV", sep=",", encoding='utf8') # 상품
data = pd.DataFrame(data=rows, columns=['pid', 'brand', 'pname', 'img_url',
  'color', 'type', 'unknown'])
#print(data)

use = data.loc[:][['brand', 'color', 'type']]
onehot = pd.get_dummies(use)

# user max = 943 item max = 1102
# index, user, itme, rate

query = "select * from preferences"
cur.execute(query)
rows = np.array(cur.fetchall())
ranking = pd.DataFrame(data=rows, columns=['idx', 'uid', 'pid', 'rate'])
#print(ranking[0])
query = "select * from preferences where SN=%d"% new_user
cur.execute(query)
rows = np.array(cur.fetchall())
new_user_data = rows[:][:, 1:]
conn.close()

del ranking["idx"]



# CB
like_item = np.array(ranking.loc[ ranking['uid'] == new_user_data[0][0]]['pid'] - 1) # new_user id,
onehot = np.array(onehot)

item_rate = []
for i in range(len(new_user_data)):
	item_rate.append([new_user_data[i][2]])



q = np.array(like_item).astype(int)

weight = onehot[q][:, :] * item_rate
#normalize
user_profile = sum(weight)
#print(user_profile[0])
user_profile = user_profile / sum(user_profile)
#print(user_profile)

weighted_item = user_profile * onehot[:][:, :]

weighted_sum = weighted_item.sum(axis = 1)
recommend_CB = np.random.choice(np.flatnonzero(weighted_sum == weighted_sum.max())) + 1 # 상품번호는 1부터 시작하므로

#print(recommend_CB)

# CF
ranking['rate'] = ranking['rate'].astype(float)
#ranking = ranking.astype(float)
user_rating = ranking.pivot_table(index='uid', columns='pid', values='rate')
corr = user_rating.corr(method = 'pearson', min_periods=1)
corr = corr.sort_values(by=recommend_CB, ascending=False)

# 상위 20개
recommend = corr.loc[:][recommend_CB].iloc[0:20]
#print(recommend)
#print(recommend.index[0])

print(np.array(recommend.index).tolist())
#print(recommend)

#for i in range(20):
#	print(data.loc[ data['pid'] == recommend.index[i] ])

# ubuntu@13.125.41.85
