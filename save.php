<?php
function saveJson($filename, $contents) {
    $fp = fopen($filename, "w");
    fwrite($fp, json_encode($contents));
    fclose($fp);
}

$data      = $_POST["data"];
$save_json = file_get_contents("save.json");
$save      = json_decode($save_json);

array_push($save, json_decode($data));

saveJson("save.json", $save);
?>