 export OUT_FILE=`sui client active-env`.pub.out

 export UpgradeCap=`cat ./${OUT_FILE} |grep -B4 UpgradeCap |grep ObjectID |awk -F ' ' '{print $4}'`
 sui client upgrade  --upgrade-capability "${UpgradeCap}" > upgrade.out
