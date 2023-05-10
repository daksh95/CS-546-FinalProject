# CS 546 - Project (Group 16)

# TradeMyProperty

### Group Members

- Bhavin Patanwadia (20012831)
- Daksh Mehta (20012280)
- Tanya Goel (20010788)
- Yash Shah (20011458)

# Introduction

**TradeMyProperty** (formerly known as the **National Land Exchange Portal**) acts as a platform for users to search, view, sell and purchase properties in certain areas of the USA (such as New York, New Jersey, etc).

This sale and purchase of land is overseen by a regulatory governing body (the **admin** account) which has more privileges to the portal approves each and every transaction happening on it.

A user can add a land that they own after creating their account.
After each transaction (whether successful or not), both the buyer and seller has the opportunity to rate the other party (To avoid frauds and protect both users).

Apart from admin, sellers, and buyers, there are be three more entities involved in each transaction - a title company, a land surveyor and government, who verify and approve/reject transactions from their end, send an update to both the parties about the reason for rejection, and terminate the whole transaction. This gives both parties an option to back out of the transaction unharmed, or re-start the transaction with correct details.

# Core Features

## Account Roles

Our website has 5 roles, each with different privileges and interactions -

- **User**
  - Can buy and sell properties
  - Can add their _already owned_ land to the website, and put it for sale
- **Admin**
  - Will approve/reject newly added land
  - Will approves/rejects new account creation for all the other types of users
  - Will approve/reject all land transactions at the end
  - Will transfer land ownership from one profile to another
- **Land Surveyor** - Will approve/reject the transaction based on transaction details, seller details and buyer details
- **Title Company** - Will approve/reject the transaction based on transaction details, seller details and buyer details
- **Government** - Will approve/reject the transaction based on transaction details, seller details and buyer details

The last 3 account types are also referred to as **entities** in our code, and our grouped together due to the similarity of their privileges and interactions in the scope of our project.

## Role-Wise Interactions (Pages of Website)

### User

- Main page

  - Search for property by area (implemented using AJAX)
  - Sort (by pricing) the listed properties
  - Filter (by pricing and area) the listed properties
  - Lands which are 'on sale' are displayed.

- Property Page

  - Information about the selected property
  - (From buyer side) Option to contact the seller
  - (From buyer side) Place bid for the property
  - (From seller side) Put land on sale

- Transaction Page

  - (From buyer's side) Request for buying the selected property
  - (From seller's side) Approve or disapprove the request.
  - Track transaction progress

- User Profile Page

  - Personal Information
  - Reputation; derived from rating system

- Land Surveyor Profile Page

  - Land Surveyors Information
  - (From land surveyor's side) Approve/Reject transaction; Comment needs to be inputted to make both approve and reject button available.

- Title Company Page

  - Title Company's Information
  - (From title company's side) Approve/Reject transaction; Comment needs to be inputted to make both approve and reject button available.

- Government Page:
  - Government Information
  - (From government side) Approve/Reject transaction; Comment needs to be inputted to make both approve and reject button available.

### Admin

- Main Page
  - View all properties
- Account App
  - Approve or reject new user’s account; Comment needs to be inputted to make reject button available
- Property Approvals Page
  - Approve or reject land added by users; Comment needs to be inputted to make reject button available
- Transaction Approvals Page
  - Approve or reject the transaction after it goes through all the steps – land surveyor approval, title company approval and government approval; Comment needs to be inputted to make reject button available.

### Entities (Land Surveyor / Title Company / Government)

- Main Page
  - Welcome page
  - Show count of all transactions assigned to and count of pending transactions (each entity can have a maximum of 25 pending transactions at a time).
- All Transactions Page
  - View all the transactions assigned to them.
  - Approve/Reject transaction; If rejected, then mention reason in comment box.
- Pending Transactions Page
  - View all the pending transactions assigned to them
- Transaction Page
  - Details about the transaction, seller and buyer.
  - Approve/Reject transaction; Comment needs to be inputted to make both approve and reject button available.

## Extra Features

We have implemented one extra feature mentioned in our original proposal.

Earlier, admin was responsible for warning users about low rating. We have adopted a new approach, and each user will be shown a warning in their Profile page automatically when their rating reaches below 2.

GitHub Link: [daksh95/CS-546-FinalProject](https://github.com/daksh95/CS-546-FinalProject)

## Setting Up and Installation

Please clone the repo or extract the zip, open Terminal inside the folder and type:

    npm i

This will install all the dependencies locally. Now type:

    npm start

to run the project.

Since we are using MongoDB Atlas which is cloud-based, therefore there is no requirement to run a seed file since all the seed data has already been set up.

If you are Professor Patrick or one of the TAs grading this project, you will find a .env file included in the zip, which contains a MONGO_URI object

In order to access the database using Compass, please copy and paste the URI when you start Compass. The connection URI should look like this -

    mongodb+srv://<username>:<password>@webproject.zfz2ccf.mongodb.net/WebProject

Once it succeeds, you are free to access the seed data.

## Account Credentials

Please find the credentials for the 5 account roles in [userpass.txt](InitialWork/userpass.txt)

### Flowcharts

You can find two flowcharts which would be helpful in understanding the website.

[Flowchart1](InitialWork/Flowchart1.png)

[Flowchart2](InitialWork/Flowchart2.png)
