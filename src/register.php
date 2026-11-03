<?php
header("Access-Control-Allow-Origin: http://eastmanone.com:8000");
header("Content-Type: application/json; charset=UTF-8");

include('config.php'); // $con (sqlsrv connection)

if (!defined('SQLSRV_FETCH_ASSOC')) define('SQLSRV_FETCH_ASSOC', 2);

$params = array();
$options = array("Scrollable" => SQLSRV_CURSOR_KEYSET);
$response = array();

function respond($success, $status, $extra = array()) {
    $out = array_merge(array(
        "success" => (string)$success,
        "status"  => $status
    ), $extra);

    echo json_encode($out, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond("0", "Invalid Request Method");
}

$type     = isset($_POST['type']) ? trim($_POST['type']) : '';
$imei_no  = isset($_POST['imei_no']) ? trim($_POST['imei_no']) : '';
$serial_no= isset($_POST['serial_no']) ? trim($_POST['serial_no']) : '';
$phase    = isset($_POST['phase']) ? trim($_POST['phase']) : ''; // only for GTI

if ($type === '' || $imei_no === '' || $serial_no === '') {
    respond("0", "Required fields missing: type, imei_no, serial_no");
}

$typeUpper = strtoupper($type);
if ($typeUpper !== 'NON GTI' && $typeUpper !== 'GTI') {
    respond("0", "Invalid type. Allowed: NON GTI, GTI");
}

if ($typeUpper === 'GTI' && $phase === '') {
    respond("0", "Phase is required for type=GTI");
}

/*
  NOTE:
  - Your DB column name is "Imei" (used as IMEI for NON GTI, and MAC for GTI pages)
  - We'll keep inserting into EastmenIotMaster(Imei, SerialNo, type, phase)
*/

// 1) Duplicate check by Imei
$sqlCheckImei = "SELECT TOP 1 ID FROM EastmenIotMaster WITH (NOLOCK) WHERE Imei = ? AND type = ?";
$stmt1 = sqlsrv_query($con, $sqlCheckImei, array($imei_no, $typeUpper), $options);
if ($stmt1 === false) {
    respond("0", "DB Error (check IMEI)", array("error" => sqlsrv_errors()));
}
if (sqlsrv_num_rows($stmt1) > 0) {
    $msg = ($typeUpper === 'GTI') ? "MAC already added" : "ImeiNo already added";
    respond("0", $msg);
}

// 2) Duplicate check by SerialNo
$sqlCheckSerial = "SELECT TOP 1 ID FROM EastmenIotMaster WITH (NOLOCK) WHERE SerialNo = ? AND type = ?";
$stmt2 = sqlsrv_query($con, $sqlCheckSerial, array($serial_no, $typeUpper), $options);
if ($stmt2 === false) {
    respond("0", "DB Error (check SerialNo)", array("error" => sqlsrv_errors()));
}
if (sqlsrv_num_rows($stmt2) > 0) {
    respond("0", "SerialNo already added");
}

// 3) Insert
if ($typeUpper === 'NON GTI') {

    $sqlIns = "INSERT INTO dbo.EastmenIotMaster (Imei, SerialNo, type) VALUES (?, ?, ?)";
    $stmtIns = sqlsrv_query($con, $sqlIns, array($imei_no, $serial_no, $typeUpper));

    if ($stmtIns === false) {
        respond("0", "Registration Unsuccessfull", array("error" => sqlsrv_errors()));
    }

    // get inserted id
    $stmtId = sqlsrv_query($con, "SELECT SCOPE_IDENTITY() AS NewID");
    $rowId = sqlsrv_fetch_array($stmtId, SQLSRV_FETCH_ASSOC);
    $newId = isset($rowId['NewID']) ? (string)$rowId['NewID'] : "";

    respond("1", "Registration successfull", array(
        "ID" => $newId,
        "type" => $typeUpper,
        "Imei" => $imei_no,
        "SerialNo" => $serial_no
    ));

} else { // GTI

    $sqlIns = "INSERT INTO dbo.EastmenIotMaster (Imei, SerialNo, type, phase) VALUES (?, ?, ?, ?)";
    $stmtIns = sqlsrv_query($con, $sqlIns, array($imei_no, $serial_no, $typeUpper, $phase));

    if ($stmtIns === false) {
        respond("0", "Registration Unsuccessfull", array("error" => sqlsrv_errors()));
    }

    $stmtId = sqlsrv_query($con, "SELECT SCOPE_IDENTITY() AS NewID");
    $rowId = sqlsrv_fetch_array($stmtId, SQLSRV_FETCH_ASSOC);
    $newId = isset($rowId['NewID']) ? (string)$rowId['NewID'] : "";

    respond("1", "Registration successfull", array(
        "ID" => $newId,
        "type" => $typeUpper,
        "MAC" => $imei_no,      // aapke form me ye MAC hota hai
        "SerialNo" => $serial_no,
        "phase" => $phase
    ));
}

sqlsrv_close($con);
?>