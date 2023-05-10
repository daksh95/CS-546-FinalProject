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
  - Can add their *already owned* land to the website, and put it for sale
- **Admin**
  - Will approve/reject newly added land
  - Will approves/rejects new account creation for all the other types of users
  - Will approve/reject all land transactions at the end
  - Will transfer land ownership from one profile to another
-	**Land Surveyor** - Will approve/reject the transaction based on transaction details, seller details and buyer details
-	**Title Company** - Will approve/reject the transaction based on transaction details, seller details and buyer details
-	**Government** - Will approve/reject the transaction based on transaction details, seller details and buyer details 

The last 3 account types are also referred to as **entities** in our code, and our grouped together due to the similarity of their privileges and interactions in the scope of our project.

## Role-Wise Interactions (Pages of Website)

### User

- Main page
  - Search for property by area (implemented using AJAX)
  - Sort (by pricing) the listed properties
  - Filter (by pricing and area) the listed properties
  - Lands which are 'on sale' are displayed.


-	Property Page -
    - Information about the selected property
    - (From buyer side) Option to contact the seller
    - (From buyer side) Place bid for the property
    - (From seller side) Put land on sale


-	Transaction Page -
    - (From buyer's side) Request for buying the selected property
    - (From seller's side) Approve or disapprove the request.
    - Track transaction progress

-	User Profile Page -
    - Personal Information
    - Reputation; derived from rating system


-	Land Surveyor Profile Page -
    - Land Surveyors Information
    - (From land surveyor's side) Approve/Reject transaction; Comment needs to be inputted to make both approve and reject button available.

-	Title Company Page:
  - Title Company's Information
  - (From title company's side) Approve/Reject transaction; Comment needs to be inputted to make both approve and reject button available.

-	Government Page:
  - Government Information
  - (From government side) Approve/Reject transaction; Comment needs to be inputted to make both approve and reject button available.
