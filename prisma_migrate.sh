#author: https://github.com/osamaMsaeed
#!/bin/bash

# Check the number of arguments
if [ $# -ne 1 ]; then
    echo "Error: Not enough arguments. Required 1 (down migration path)"
    exit 1
fi

# Task 1: Take migration name input from the user
read -p "Enter migration name: " input
timestamp=$(date +%s)
mgName="${input}_${timestamp}"
downMigrationsDir=$1
mkdir -p "$downMigrationsDir" 

# Task 2: Execute the down command with mgName and save the output to downOut.sql
command="npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script > $downMigrationsDir/downOut.sql"
#replace downOut with mgName
command=${command//downOut/$mgName}
eval $command

# Check if the down command was successful
if [ $? -eq 0 ]; then
  echo "Down script generated successfully and output saved to $downMigrationsDir/$mgName.sql"

  # Task 3: Run the generate up migration command and provide mgName as input if required
  npx prisma migrate dev <<< "$mgName"
    if [ $? -eq 0 ]; then
    echo "Up Migration generated successfully"
    else
    echo "Error generating the up migration."
    echo "Deleting the down migration."
    rm $downMigrationsDir/$mgName.sql
    fi
  
else
  echo "Error generating the down script. Please check your input or command."
  rm $downMigrationsDir/$mgName.sql
fi