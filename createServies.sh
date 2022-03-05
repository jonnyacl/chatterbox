#!/bin/sh
export GOOGLE_KEY=$1

rm -f google-services.json

echo "{
    \"type\": \"service_account\",
    \"project_id\": \"chatterbox-d2f52\",
    \"private_key_id\": \"47851dd38a88d8191afd999039c06268eca2e670\",
    \"private_key\": \"$GOOGLE_KEY\",
    \"client_email\":
      \"firebase-adminsdk-s9e4s@chatterbox-d2f52.iam.gserviceaccount.com\",
    \"client_id\": \"102131302307421245651\",
    \"auth_uri\": \"https://accounts.google.com/o/oauth2/auth\",
    \"token_uri\": \"https://oauth2.googleapis.com/token\",
    \"auth_provider_x509_cert_url\": \"https://www.googleapis.com/oauth2/v1/certs\",
    \"client_x509_cert_url\":
      \"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-s9e4s%40chatterbox-d2f52.iam.gserviceaccount.com\"
}" >> google-services.json