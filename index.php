<?php
// 1. Подключаемся к простой базе SQLite (файл database.db)
$db = new PDO('sqlite:database.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 2. Создаём таблицу для смен, если её нет
$db->exec("CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT NOT NULL,
    shift_date DATE NOT NULL,
    hours REAL NOT NULL,
    rate REAL NOT NULL DEFAULT 500,
    earnings GENERATED ALWAYS AS (hours * rate) VIRTUAL
)");

// 3. Если добавили новую смену - сохраняем
if ($_POST['action'] == 'add') {
    $stmt = $db->prepare("INSERT INTO shifts (employee_name, shift_date, hours, rate) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $_POST['employee_name'],
        $_POST['shift_date'],
        $_POST['hours'],
        $_POST['rate']
    ]);
}

// 4. Получаем все смены для отображения
$shifts = $db->query("SELECT * FROM shifts ORDER BY shift_date DESC")->fetchAll(PDO::FETCH_ASSOC);

// 5. Считаем общий заработок для каждого сотрудника
$totals = $db->query("
    SELECT employee_name, 
           SUM(hours) as total_hours, 
           SUM(hours * rate) as total_earnings 
    FROM shifts 
    GROUP BY employee_name
")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html>
<head><title>График смен</title><meta charset="utf-8"></head>
<body>
    <h2>Добавить смену</h2>
    <form method="POST">
        <input type="hidden" name="action" value="add">
        <input type="text" name="employee_name" placeholder="Имя сотрудника" required>
        <input type="date" name="shift_date" required>
        <input type="number" step="0.5" name="hours" placeholder="Часы" required>
        <input type="number" name="rate" placeholder="Ставка (руб.)" value="500">
        <button type="submit">Добавить</button>
    </form>

    <h2>Все смены</h2>
    <table border="1">
        <tr><th>Дата</th><th>Сотрудник</th><th>Часы</th><th>Ставка</th><th>Заработок</th></tr>
        <?php foreach ($shifts as $shift): ?>
        <tr>
            <td><?= $shift['shift_date'] ?></td>
            <td><?= $shift['employee_name'] ?></td>
            <td><?= $shift['hours'] ?></td>
            <td><?= $shift['rate'] ?></td>
            <td><strong><?= $shift['hours'] * $shift['rate'] ?> руб.</strong></td>
        </tr>
        <?php endforeach; ?>
    </table>

    <h2>Итоги по сотрудникам</h2>
    <table border="1">
        <tr><th>Сотрудник</th><th>Всего часов</th><th>Всего заработок</th></tr>
        <?php foreach ($totals as $row): ?>
        <tr>
            <td><?= $row['employee_name'] ?></td>
            <td><?= $row['total_hours'] ?></td>
            <td><strong><?= $row['total_earnings'] ?> руб.</strong></td>
        </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>