export LOG_FILE='../../contracts/file_blob/testnet.pub.out'
export  STORAGE=`cat  $LOG_FILE |grep -B5 file_blob::Storage |grep ObjectID | awk -F ' ' '{print $4}' `
export  PACKAGE=`cat $LOG_FILE |grep file_blob::Storage |awk -F ' ' '{print $4}' | awk -F ':' '{print $1}' `
export  OPERATOR=`cat $LOG_FILE  |grep -B5 file_blob::Storage |grep Sender |awk -F ' ' '{print $4}'`
export  SUI_NET=`sui client active-env`
echo "STORAGE=$STORAGE"
echo "FILE_BLOB_PACKAGE=$PACKAGE"
echo "OPERATOR=$OPERATOR"

npx tsx ./saveEnv.ts
cat ./config.json

