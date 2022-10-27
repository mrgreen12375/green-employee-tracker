const inquirer = require('inquirer');
const mysql = require('./config/connection');
require('console.table');

const addDepartmentQuestions = [
    {
        type: 'input',
        name: 'departmentName',
        message: 'What is the name of the department?\n'
    }
]

const addEmployeeQuestions = [
    {
        type: 'input',
        name: 'firstName',
        message: 'What is the employee\'s first name? \n'
    },
    {
        type: 'input',
        name: 'lastName',
        message: 'What is the employee\'s last name? \n'
    }
]

const addRoleQuestions = [
    {
        type: 'input',
        name: 'roleName',
        message: 'What is the name of the role?\n'
    },
    {
        type: 'number',
        name: 'salaryAmount',
        message: 'What is the salary of the role?\n'
    }
]

const menuQuestions = [
    {
        type:'list',
        name: 'menuChoice',
        message: 'What would you like to do?',
        choices: ['View All Employees', 
                  'Add Employee',
                  'Update Employee Role', 
                  'View All Roles', 
                  'Add Role',
                  'View All Departments',
                  'Add Department',
                  'Quit']
    }
]

const addDepartment = () =>{
    inquirer
        .prompt(addDepartmentQuestions)
        .then(({departmentName})=>{
            mysql.promise().query(`INSERT INTO department(name)
            VALUE ('${departmentName}');`)
            .then(res=>{
                console.log(`Added ${departmentName} to database`);
                showList();
            })
        })
}

const viewDepartment = () =>{
    mysql.promise().query('SELECT * from department;').then(res=>{
        console.table(res[0])
        showList()
    });
}

const viewRoles = () =>{
    mysql.promise().query(`SELECT role.id, role.title, department.name as department, role.salary 
                FROM role JOIN department ON role.department_id = department.id;`)
    .then(res=>{
        console.table(res[0])
        showList()
    });
}

const viewEmployees = () =>{
    mysql.promise().query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT (manager.first_name, " ", manager.last_name) AS manager 
                          FROM employee
                          LEFT JOIN role ON employee.role_id = role.id 
                          LEFT JOIN department ON role.department_id = department.id 
                          LEFT JOIN employee manager ON employee.manager_id = manager.id`)
    .then(res =>{
        console.table(res[0]);
        showList();
    });

}

const addEmployee = () =>{

    inquirer.prompt(addEmployeeQuestions)

    .then(({firstName, lastName})=>{
        
        mysql.query(`SELECT role.id, role.title FROM role`, (err, results) =>{
            if (err){
                console.log(err);
                return;
            }
            const employeeRoles = results.map(({ id, title }) => ({ name: title, value: id }));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'newEmployeeRole',
                    message: 'What is the employee\'s role?',
                    choices: employeeRoles
                }
            ])
            .then((result)=>{
                const employeeRoleId = result.newEmployeeRole;

                mysql.query('SELECT * FROM employee', (err, results)=>{
                    if(err){
                        console.log(err);
                        return;
                    }
                    const managerList = results.map(({id, first_name, last_name})=>({name: `${first_name} ${last_name}`, value: id}));
                    inquirer.prompt([
                        {
                            type:'list',
                            name: 'newEmployeeManager',
                            message: 'Who is the employee\'s manager? \n',
                            choices: managerList
                        }
                    ])
                    .then((result=>{
                        const managerId = result.newEmployeeManager;

                        mysql.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                        VALUES ('${firstName}', '${lastName}', ${employeeRoleId}, ${managerId})`, (err, result) =>{
                            if(err){
                                console.log(err);
                                return;
                            }
                            console.log(`New Employee: ${firstName} ${lastName} has been added!`);
                            showList();
                        });
                    }));
                });
            });
        });
    });
};

const addRole= () =>{
    inquirer.prompt(addRoleQuestions)
    .then(({roleName, salaryAmount})=>{
        mysql.query(`SELECT name, id FROM department`, (err, result) =>{
            if(err){
                console.log(err);
                return;
            }
            const currentDepartments = result.map(({name,id})=>({name, value: id}));

            inquirer.prompt([
                {
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: currentDepartments
                }
            ])
            .then(({department})=>{
                mysql.query(`INSERT INTO role (title, salary, department_id)
                VALUES ('${roleName}', '${salaryAmount}', ${department})`, (err, result)=>{
                    if(err){
                        console.log(err);
                        return;
                    }
                    console.log(`${roleName} has been added to the roles!`);
                    showList();
                });
            });
        });
    });
};

const updateEmployeeRole = () =>{
    mysql.query(`SELECT * from employee`, (err, result) =>{
        if(err){
            console.log(err);
            return;
        }
        const currentEmployees = result.map(({id, first_name, last_name}) => ({name: `${first_name} ${last_name}`, value: id}));

        inquirer.prompt([
            {
                type: 'list',
                name: 'selectedEmployee',
                message: 'Which employee\'s role do you want to update?',
                choices: currentEmployees
            }
        ])
        .then(({selectedEmployee})=>{
            mysql.query(`SELECT * FROM role`, (err, result) =>{
                if (err){
                    console.log(err);
                    return;
                }
                const currentRoles = result.map(({id, title}) => ({ name: title, value: id}));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'selectionRole',
                        message: 'Which role do you want to assign the selected employee?',
                        choices: currentRoles,
                    }
                ])
                .then(({selectionRole}) =>{
                    mysql.query(`UPDATE employee
                    SET role_id = ${selectionRole} WHERE id = ${selectedEmployee}`, (err, result)=>{
                        if(err){
                            console.log(err);
                            return;
                        }
                        console.log('Employee Role Updated');
                        showList();
                    });
                });
            });
        });
    });
};

const listOptions = (response) =>{
    switch(response.menuChoice){
        case 'View All Employees':
            viewEmployees();
            break;
        case 'Add Employee':
            addEmployee();
            break;
        case 'Update Employee Role':
            updateEmployeeRole();
            break;
        case 'View All Roles':
            viewRoles();
            break;
        case 'Add Role':
            addRole();
            break;
        case 'View All Departments':
            viewDepartment();
            break;
        case 'Add Department':
            addDepartment();
            break;
        case 'Quit':
            console.log('I am Quitting now');
            mysql.end();
            break;
    }
}

const employeeGraphic = () =>{
    console.log(" _____                 _                       \r\n| ____|_ __ ___  _ __ | | ___  _   _  ___  ___ \r\n|  _| | \'_ ` _ \\| \'_ \\| |\/ _ \\| | | |\/ _ \\\/ _ \\\r\n| |___| | | | | | |_) | | (_) | |_| |  __\/  __\/\r\n|_____|_| |_| |_| .__\/|_|\\___\/ \\__, |\\___|\\___|\r\n                |_|            |___\/           \r\n __  __                                   \r\n|  \\\/  | __ _ _ __   __ _  __ _  ___ _ __ \r\n| |\\\/| |\/ _` | \'_ \\ \/ _` |\/ _` |\/ _ \\ \'__|\r\n| |  | | (_| | | | | (_| | (_| |  __\/ |   \r\n|_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|   \r\n                          |___\/           \r\n")
}

const showList = () =>{
    inquirer
        .prompt(menuQuestions)
        .then((response)=>listOptions(response))
}

const init = () =>{
    employeeGraphic();
    showList();
}

init();