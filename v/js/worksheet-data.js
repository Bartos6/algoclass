window.AlgoBuiltinSheets = [
 {
  "id": "builtin-if-cpp",
  "title": "Warunki if – C++",
  "lang": "cpp",
  "topic": "if",
  "classId": "",
  "tasks": [
   {
    "id": "if-cpp-1",
    "title": "Porównywanie liczb",
    "level": "1",
    "code": "#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    if (a > b) {\n        a = a - b;\n    } else {\n        b = b - a;\n    }\n    cout << a << \" \" << b << \"\\n\";\n}",
    "input": "4 9",
    "memory": "a = 4\nb = 9, 5",
    "output": "4 5"
   },
   {
    "id": "if-cpp-2",
    "title": "Dwa niezależne warunki",
    "level": "2",
    "code": "#include <iostream>\nusing namespace std;\nint main() {\n    int x;\n    cin >> x;\n    if (x % 2 == 0) x = x + 3;\n    if (x > 6) x = x - 2;\n    cout << x << \"\\n\";\n}",
    "input": "4",
    "memory": "x = 4, 7, 5",
    "output": "5"
   }
  ],
  "builtin": true
 },
 {
  "id": "builtin-while-cpp",
  "title": "Pętle while – C++",
  "lang": "cpp",
  "topic": "while",
  "classId": "",
  "tasks": [
   {
    "id": "while-cpp-1",
    "title": "Suma kolejnych liczb",
    "level": "1",
    "code": "#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    int i = 1, suma = 0;\n    while (i <= n) {\n        suma = suma + i;\n        i = i + 1;\n    }\n    cout << suma << \"\\n\";\n}",
    "input": "3",
    "memory": "n = 3\ni = 1, 2, 3, 4\nsuma = 0, 1, 3, 6",
    "output": "6"
   },
   {
    "id": "while-cpp-2",
    "title": "Zmniejszanie liczby",
    "level": "2",
    "code": "#include <iostream>\nusing namespace std;\nint main() {\n    int x, kroki = 0;\n    cin >> x;\n    while (x > 1) {\n        x = x / 2;\n        kroki++;\n    }\n    cout << x << \" \" << kroki << \"\\n\";\n}",
    "input": "10",
    "memory": "x = 10, 5, 2, 1\nkroki = 0, 1, 2, 3",
    "output": "1 3"
   }
  ],
  "builtin": true
 },
 {
  "id": "builtin-if-python",
  "title": "Warunki if – Python",
  "lang": "python",
  "topic": "if",
  "classId": "",
  "tasks": [
   {
    "id": "if-python-1",
    "title": "Porównywanie liczb",
    "level": "1",
    "code": "a, b = map(int, input().split())\nif a > b:\n    a = a - b\nelse:\n    b = b - a\nprint(a, b)",
    "input": "4 9",
    "memory": "a = 4\nb = 9, 5",
    "output": "4 5"
   },
   {
    "id": "if-python-2",
    "title": "Dwa niezależne warunki",
    "level": "2",
    "code": "x = int(input())\nif x % 2 == 0:\n    x = x + 3\nif x > 6:\n    x = x - 2\nprint(x)",
    "input": "4",
    "memory": "x = 4, 7, 5",
    "output": "5"
   }
  ],
  "builtin": true
 },
 {
  "id": "builtin-while-python",
  "title": "Pętle while – Python",
  "lang": "python",
  "topic": "while",
  "classId": "",
  "tasks": [
   {
    "id": "while-python-1",
    "title": "Suma kolejnych liczb",
    "level": "1",
    "code": "n = int(input())\ni = 1\nsuma = 0\nwhile i <= n:\n    suma = suma + i\n    i = i + 1\nprint(suma)",
    "input": "3",
    "memory": "n = 3\ni = 1, 2, 3, 4\nsuma = 0, 1, 3, 6",
    "output": "6"
   },
   {
    "id": "while-python-2",
    "title": "Zmniejszanie liczby",
    "level": "2",
    "code": "x = int(input())\nkroki = 0\nwhile x > 1:\n    x = x // 2\n    kroki += 1\nprint(x, kroki)",
    "input": "10",
    "memory": "x = 10, 5, 2, 1\nkroki = 0, 1, 2, 3",
    "output": "1 3"
   }
  ],
  "builtin": true
 }
];
