type School ={
    name : string ,
    master : string,
}

type Emp ={
    name : string;
    age : number;
    work_no ? : string;
    school ? : School;
}
function showEmp(emp:Emp){
    let sname = emp.school?.name;
    console.log(sname);
}

function test_emp(){
    let emp : Emp ={
        name : 'ljl',
        age : 33,
    }

    showEmp(emp)

    let emp2 : Emp ={
        name : 'ljl',
        age : 33,
        school:{
            name :'yizhong',
            master : 'charles'
        }
    }

    showEmp(emp2)
}

test_emp();