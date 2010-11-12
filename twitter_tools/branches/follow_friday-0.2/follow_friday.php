<?php
header("Content-type: text/plain");
include_once("/path/to/twitteroauth.php");
define(CONSUMER_KEY, "CONSUMER_KEY");
define(CONSUMER_SECRET, "CONSUMER_SECRET");
define(OAUTH_TOKEN, "OAUTH_TOKEN");
define(OAUTH_TOKEN_SECRET, "OAUTH_TOKEN");

$followfriday_file = "/path/to/followfriday_list";
$max = 140;
$debug = 1;

if (is_readable($followfriday_file)) {
    $followfriday_array = file($followfriday_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
} else {
    die ("$file is unreadable.\n");
}

foreach ($followfriday_array as $l) {
    $num_of_matches = preg_match_all("/%(.*)/", $l, $status, PREG_PATTERN_ORDER);
    if ($num_of_matches > 0) {
        if (strlen($status[0]) > $max) {
            echo "Unable to post status because it is too long: {$status[0]} (" . strlen($status[0]) . ")\n";
        } else {
            twitter_update($status[0]);
        }
    } else {
        preg_match_all("/(\#\w+)/", $l, $hash_tags, PREG_PATTERN_ORDER);
        $line = implode(" ", $hash_tags[0]);
        
        preg_match_all("/(@\w+)/", $l, $users, PREG_PATTERN_ORDER);
        echo "Number of users for $line: " . count($users[0]) . "\n";
        $follow_friends = implode(" ", $users[0]);

        $max_line = $max - strlen($line) - 1;

        $followfriday_status_array = explode("\n", wordwrap($follow_friends, $max_line, "\n"));

        foreach ($followfriday_status_array as $s) {
            if ($debug == 0) {
                $content = twitter_update($s . " $line");
                if (isset($content->id)) {
                    echo "SUCCESS: " . print_r("$s $line", TRUE) . "\n";
                    sleep(60);
                } else {
                    die ("Unable to update twitter: " . print_r($content, TRUE) . "\n");
                }
            } else {
                echo "DEBUG $debug: " . print_r("$s $line", TRUE) . "\n";
            }
        }
    }
}


# =-=-=-=-=- FUNCTIONS -=-=-=-=-= #

function getConnectionWithAccessToken() {
    $connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET);
    return $connection;
}

function twitter_update($status) {
    $params = array('status' => $status);
    $connection = getConnectionWithAccessToken();
    $content = $connection->post("statuses/update", $params);

    if (isset($content->error)) {
	die("OAuth error: " . $content->error . "\n");
    } else {
	return $content;
    }
}
?>
