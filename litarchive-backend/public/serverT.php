<?php

function request($method, $url, $data = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    $response = curl_exec($ch);
    $info = curl_getinfo($ch);
    $error = curl_error($ch);
    curl_close($ch);
    return ['status' => $info['http_code'], 'body' => $response, 'error' => $error];
}

$base = 'http://localhost:8000/public/server.php/books';

// 1. Test DB connection (GET all books)
$get = request('GET', $base);
$tests[] = [
    'name' => 'GET /books (DB connection)',
    'passed' => $get['status'] === 200 && $get['error'] === '',
    'status' => $get['status'],
    'body' => $get['body']
];

// 2. Test POST (add a book)
$newBook = [
    'title' => 'Test Book',
    'author' => 'Test Author',
    'isbn' => '1234567890',
    'description' => 'Test Description',
    'image' => 'test.jpg',
    'status' => 'available',
    'copies' => 1,
    'category' => 'Test',
    'ebookLink' => 'http://example.com/ebook'
];
$post = request('POST', $base, $newBook);
$postData = json_decode($post['body'], true);
$bookId = $postData['id'] ?? null;
$tests[] = [
    'name' => 'POST /books (add book)',
    'passed' => $post['status'] === 200 && $bookId,
    'status' => $post['status'],
    'body' => $post['body']
];

// 3. Test PUT (update the book)
if ($bookId) {
    $updateBook = $newBook;
    $updateBook['title'] = 'Updated Test Book';
    $put = request('PUT', "$base/$bookId", $updateBook);
    $tests[] = [
        'name' => 'PUT /books/{id} (update book)',
        'passed' => $put['status'] === 200 && strpos($put['body'], 'success') !== false,
        'status' => $put['status'],
        'body' => $put['body']
    ];
}

// 4. Test DELETE (remove the book)
if ($bookId) {
    $del = request('DELETE', "$base/$bookId");
    $tests[] = [
        'name' => 'DELETE /books/{id} (delete book)',
        'passed' => $del['status'] === 200 && strpos($del['body'], 'success') !== false,
        'status' => $del['status'],
        'body' => $del['body']
    ];
}

// 5. Test GET with invalid resource
$invalid = request('GET', 'http://localhost:8000/public/server.php/invalid');
$tests[] = [
    'name' => 'GET /invalid (invalid resource)',
    'passed' => $invalid['status'] === 404,
    'status' => $invalid['status'],
    'body' => $invalid['body']
];

// Output results
header('Content-Type: application/json');
echo json_encode($tests, JSON_PRETTY_PRINT);