<?php
/* =-=-=-=-=- Faithful Follow Friday v. 0.3 -=-=-=-=-=
 * Written by Michael Soh
 * http://code.google.com/p/tailgate/wiki/FaithfulFollowFriday
 *
 * Requires @abraham's twitteroauth, available for download on the 
 * webpage above or directly on abraham's site:
 * http://github.com/abraham/twitteroauth
 *
 * Please visit my website for instructions on how to use the script 
 * and the changelog.
 */

// Change variables here
include_once("/path/to/twitteroauth.php"); // Change this to the full path
define(CONSUMER_KEY, "CONSUMER_KEY");
define(CONSUMER_SECRET, "CONSUMER_SECRET");
define(OAUTH_TOKEN, "OAUTH_TOKEN");
define(OAUTH_TOKEN_SECRET, "OAUTH_TOKEN");
$followfriday_file = "/path/to/followfriday_list";

// Setting debug to > 0 will disable posting to twitter and print 
// debug output.
$debug = 0;

// Nothing below this line should be modified.
header("Content-type: text/plain");
$max = 140;

if (is_readable($followfriday_file)) {
    $followfriday_array = file($followfriday_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
} else {
    die ("$file is unreadable.\n");
}

foreach ($followfriday_array as $l) {
    // Check first to see if the line starts with a `%`.
    $num_of_matches = preg_match_all("/%(.*)/", $l, $status, PREG_PATTERN_ORDER);
    if ($num_of_matches > 0) {
        if (strlen($status[1][0]) > $max) {
            echo "Unable to post status because it is too long: {$status[1][0]} (" . strlen($status[1][0]) . ")\n";
        } else {
            twitter_update($status[1][0]);
            sleep(60);
        }
    } else {
        // Grab all the hashtags in the line and concat them
        preg_match_all("/(\#\w+)/", $l, $hash_tags, PREG_PATTERN_ORDER);
        $line = implode(" ", $hash_tags[0]);

        // Grab all of the users in the line and concat them 
        // seperately.
        preg_match_all("/(@\w+)/", $l, $users, PREG_PATTERN_ORDER);
        echo "Number of users for $line: " . count($users[0]) . "\n";
        $follow_friends = implode(" ", $users[0]);

        // Determine remaining characters left from subtracting the 
        // hashtags
        $max_line = $max - strlen($line) - 1;

        // Assign users as an array of strings not exceeding the 
        // length of $max_line
        $followfriday_status_array = explode("\n", wordwrap($follow_friends, $max_line, "\n"));

        // For each line of users, append the hashtags and post to 
        // twitter.  Wait 60 seconds between posts.
        foreach ($followfriday_status_array as $s) {
            $content = twitter_update($s . " $line");
            if (isset($content->id)) {
                echo "SUCCESS: " . print_r("$s $line", TRUE) . "\n";
                sleep(60);
            } else if ($debug == 0) {
                die ("Unable to update twitter: " . print_r($content, TRUE) . "\n");
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
    global $debug;

    if ($debug == 0) {
        $content = $connection->post("statuses/update", $params);
    } else {
        echo "DEBUG $debug: " . print_r("$status", TRUE) . "\n";
    }

    if (isset($content->error)) {
	die("OAuth error: " . $content->error . "\n");
    } else {
	return $content;
    }
}
?>
