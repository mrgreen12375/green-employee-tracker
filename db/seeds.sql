--setup seeds file to add data information to schema
INSERT INTO department (name)
VALUES
    ("Engineering"),
    ("Finance"),
    ("Legal"),
    ("Sales");

INSERT INTO role (title, salary, department_id)
VALUES
    ("Lawyer", 190000, 3),
    ("Salesperson", 60000, 4),
    ("Software Engineer", 120000, 1),
    ("Accountant", 125000, 2);

INSERT INTO employee(first_name, last_name)
VALUES
    ("Ron", "Weasley"),
    ("Hermione", "Granger"),
    ("Draco", "Malfoy"),
    ("Neville", "Longbottom"),
    ("Tom", "Riddle");  