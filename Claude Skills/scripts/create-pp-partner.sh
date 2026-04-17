#!/bin/bash
# Create a Petpooja partner in the database and send onboarding email
# Usage: ./create-pp-partner.sh <name> <email> <petpooja_restaurant_id>
source "/home/abhin/Cloud Skills/credentials.env"

NAME="${1:?Usage: $0 <name> <email> <petpooja_restaurant_id>}"
EMAIL="${2:?Usage: $0 <name> <email> <petpooja_restaurant_id>}"
PP_ID="${3:?Usage: $0 <name> <email> <petpooja_restaurant_id>}"
PASSWORD="123456"

# Step 1: Check if partner already exists with this email or restaurant ID
echo "Checking for existing partner..."
CHECK_RESULT=$(curl -s -X POST \
  "${HASURA_GRAPHQL_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -d "{
    \"query\": \"query { partners(where: { _or: [{ petpooja_restaurant_id: { _eq: \\\"$PP_ID\\\" } }, { email: { _eq: \\\"$EMAIL\\\" } }] }) { id petpooja_restaurant_id email } }\"
  }")

EXISTING_COUNT=$(echo "$CHECK_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',{}).get('partners',[])))" 2>/dev/null)

if [ "$EXISTING_COUNT" != "0" ] && [ -n "$EXISTING_COUNT" ]; then
  echo "ERROR: A partner with this email or restaurant ID already exists!"
  echo "$CHECK_RESULT" | python3 -m json.tool
  exit 1
fi

# Step 2: Create the partner
echo "Creating Petpooja partner..."
CREATE_RESULT=$(curl -s -X POST \
  "${HASURA_GRAPHQL_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -d "{
    \"query\": \"mutation CreatePpPartner(\$name: String!, \$email: String!, \$password: String!, \$petpooja_restaurant_id: String!, \$subscription_details: jsonb!, \$theme: json!) { insert_partners_one(object: { name: \$name, email: \$email, password: \$password, petpooja_restaurant_id: \$petpooja_restaurant_id, subscription_details: \$subscription_details, theme: \$theme }) { id email petpooja_restaurant_id } }\",
    \"variables\": {
      \"name\": \"$NAME\",
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\",
      \"petpooja_restaurant_id\": \"$PP_ID\",
      \"subscription_details\": {},
      \"theme\": { \"colors\": { \"text\": \"#000000\", \"bg\": \"#ffffff\", \"accent\": \"#E9701B\" }, \"menuStyle\": \"compact\" }
    }
  }")

# Check for errors
HAS_ERROR=$(echo "$CREATE_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'errors' in d else 'no')" 2>/dev/null)

if [ "$HAS_ERROR" = "yes" ]; then
  echo "ERROR: Failed to create partner!"
  echo "$CREATE_RESULT" | python3 -m json.tool
  exit 1
fi

echo "Partner created successfully!"
echo "$CREATE_RESULT" | python3 -m json.tool

# Step 3: Send onboarding email
echo ""
echo "Sending onboarding email..."

GMAIL_APP_PASSWORD="xnygmfxufblgteev"
GMAIL_USER="servicesnotime@gmail.com"
SENDER_NAME="Thrisha K"
SENDER_ORG="Notime Services (Cravings)"
MENU_MAPPING="Online"

TO_EMAILS="$EMAIL, malvi.vaghela@petpooja.com, jatan.vala@petpooja.com, rohan.sakhrani@petpooja.com, siddharth.patel@petpooja.com"
SUBJECT="New Restaurant Onboarding Of $NAME - Petpooja"

EMAIL_BODY="<div style=\"font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;\">
  <p>Dear Petpooja Team,</p>
  <p>We would like to initiate the integration process for <strong>$NAME</strong> (Restaurant ID: <strong>$PP_ID</strong>) with our platform, <strong>Cravings.</strong></p>
  <p><strong>Merchant Approval:</strong> [$NAME Owner], could you please reply to this email thread with your formal approval for this integration? This is required by the Petpooja team to proceed with the configuration.</p>
  <p><strong>Integration Details:</strong></p>
  <ul>
    <li><strong>Platform Name:</strong> Cravings</li>
    <li><strong>Restaurant ID:</strong> $PP_ID</li>
    <li><strong>Menu Mapping:</strong> Please use the <strong>[$MENU_MAPPING]</strong> menu version for the Cravings configuration.</li>
  </ul>
  <p>Petpooja Team, once we have the merchant's confirmation, please provide the necessary mapping codes so we can proceed with the technical setup.</p>
  <p>Please let us know if any further information is required.</p>
  <p>Best regards,</p>
  <p><u>$SENDER_NAME</u><br/>$SENDER_ORG</p>
</div>"

# Send email via Python (uses smtplib since nodemailer isn't available in shell)
python3 << PYEOF
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

gmail_user = "$GMAIL_USER"
gmail_pass = "$GMAIL_APP_PASSWORD"
to_emails = "$TO_EMAILS"
subject = "$SUBJECT"
sender_name = "$SENDER_NAME"
sender_org = "$SENDER_ORG"

msg = MIMEMultipart('alternative')
msg['Subject'] = subject
msg['From'] = f'"{sender_name} - {sender_org}" <{gmail_user}>'
msg['To'] = to_emails

html_body = """$EMAIL_BODY"""
msg.attach(MIMEText(html_body, 'html'))

try:
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login(gmail_user, gmail_pass)
    server.sendmail(gmail_user, [e.strip() for e in to_emails.split(',')], msg.as_string())
    server.quit()
    print("Onboarding email sent successfully!")
except Exception as e:
    print(f"Failed to send email: {e}")
PYEOF
