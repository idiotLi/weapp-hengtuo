##版本开发记录
git更新命令
1. 拉取
GIT 文件夹->右键GIT bash here
输入：git clone git@github.com:idiotLi/weapp-hengtuo.git
2. 推送
GIT/weapp-hengtuo 文件夹->右键GIT bash here
保存工作区变动：git add *
保存本地库变动： git commit -m "更新备注"
关联远程仓库：git remote add origin git@github.com:idiotLi/weapp-hengtuo.git （只需输入一次）
推送命令：git push -u origin master

##2022-10-17（01）更
1. 行政管理模块新增，对标pc端的行政管理

##2022-10-18
1. 恒拓模块->合同->添加功能完善，自动带入orders_id和orderproducts_idd两个参数。[x]
2. 恒拓模块->印染[列表]->批次管理，本地存入参数cust_01=stageorders_id和_02=orderproducts_idd两个参数。[x]

## 2022-10-19
1. 恒拓模块 首页红点提示 正常优化显示

## 2022-11-2
1. 订单模块 取消新增功能（放在二期开发）
2. 订单模块 历次列表页面增加状态判断status !=2显示增加按钮
3. 订单产品 支持查看，不支持添加（放在二期开发）

## 2022-11-4
1. 印染模块 

## 2023-2-14(暂停服装模块的更新，ERP系统开发)
1. page/manage/todolistdetail的完善，实现带权限的修改、增加和审核。
PC端完善增删改（进度的状态精简：待处理|已完成|需返工）


## 2023-2-15
1. 更新了小程序的appid