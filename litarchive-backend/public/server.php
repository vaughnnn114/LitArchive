<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept');
header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = 'root';
$dbname = 'litarchive';

$connection = new mysqli($host, $username, $password, $dbname);
if ($connection->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $connection->connect_error]);
    exit;
}   

function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);
$segments = explode('/', trim($path, '/'));
$resource = isset($segments[2]) ? $segments[2] : null;
$id = isset($segments[3]) ? $segments[3] : null;


$endpoint = $_GET['endpoint'] ?? '';

switch ($endpoint) {
    case 'books':
        if ($method === 'GET') {
            if ($id) {
                $stmt = $connection->prepare("SELECT * FROM books WHERE id = ?");
                $stmt->bind_param('i', $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $book = $result->fetch_assoc();
                echo json_encode($book);
            } else {
                $result = $connection->query("SELECT * FROM books");
                $books = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($books);
            }
        } elseif ($method === 'POST') {
            $data = getInput();
            $stmt = $connection->prepare("INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)");
            $stmt->bind_param('sssi', $data['title'], $data['author'], $data['genre'], $data['year']);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Book added successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add book']);
            }
        } elseif ($method === 'PUT' && $id) {
            $data = getInput();
            $stmt = $connection->prepare("UPDATE books SET title = ?, author = ?, genre = ?, year = ? WHERE id = ?");
            $stmt->bind_param('ssii', $data['title'], $data['author'], $data['genre'], $data['year'], $id);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Book updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update book']);
            }
        } elseif ($method === 'DELETE' && $id) {
            $stmt = $connection->prepare("DELETE FROM books WHERE id = ?");
            $stmt->bind_param('i', $id);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Book deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete book']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
    case 'authors':
        if ($method === 'GET') {
            if ($id) {
                $stmt = $connection->prepare("SELECT * FROM authors WHERE id = ?");
                $stmt->bind_param('i', $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $author = $result->fetch_assoc();
                echo json_encode($author);
            } else {
                $result = $connection->query("SELECT * FROM authors");
                $authors = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($authors);
            }
        } elseif ($method === 'POST') {
            $data = getInput();
            $stmt = $connection->prepare("INSERT INTO authors (name, bio) VALUES (?, ?)");
            $stmt->bind_param('ss', $data['name'], $data['bio']);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Author added successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add author']);
            }
        } elseif ($method === 'PUT' && $id) {
            $data = getInput();
            $stmt = $connection->prepare("UPDATE authors SET name = ?, bio = ? WHERE id = ?");
            $stmt->bind_param('ssi', $data['name'], $data['bio'], $id);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Author updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update author']);
            }
        } elseif ($method === 'DELETE' && $id) {
            $stmt = $connection->prepare("DELETE FROM authors WHERE id = ?");
            $stmt->bind_param('i', $id);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Author deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete author']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
    case 'genres':
        if ($method === 'GET') {
            if ($id) {
                $stmt = $connection->prepare("SELECT * FROM genres WHERE id = ?");
                $stmt->bind_param('i', $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $genre = $result->fetch_assoc();
                echo json_encode($genre);
            } else {
                $result = $connection->query("SELECT * FROM genres");
                $genres = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($genres);
            }
        } elseif ($method === 'POST') {
            $data = getInput();
            $stmt = $connection->prepare("INSERT INTO genres (name) VALUES (?)");
            $stmt->bind_param('s', $data['name']);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Genre added successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add genre']);
            }
        } elseif ($method === 'PUT' && $id) {
            $data = getInput();
            $stmt = $connection->prepare("UPDATE genres SET name = ? WHERE id = ?");
            $stmt->bind_param('si', $data['name'], $id);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Genre updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update genre']);
            }
        } elseif ($method === 'DELETE' && $id) {
            $stmt = $connection->prepare("DELETE FROM genres WHERE id = ?");
            $stmt->bind_param('i', $id);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Genre deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete genre']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Resource not found']);
        break;       
    }