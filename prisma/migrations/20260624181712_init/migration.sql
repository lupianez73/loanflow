-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'LOAN_OFFICER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "loan_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationNo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "loanType" TEXT NOT NULL,
    "loanAmount" REAL NOT NULL,
    "interestRate" REAL,
    "loanTerm" INTEGER NOT NULL,
    "propertyAddress" TEXT NOT NULL,
    "propertyValue" REAL NOT NULL,
    "borrowerFirstName" TEXT NOT NULL,
    "borrowerLastName" TEXT NOT NULL,
    "borrowerEmail" TEXT NOT NULL,
    "borrowerPhone" TEXT NOT NULL,
    "borrowerSSN" TEXT NOT NULL,
    "annualIncome" REAL NOT NULL,
    "creditScore" INTEGER,
    "employmentStatus" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closingDate" DATETIME,
    "approvedAt" DATETIME,
    "deniedAt" DATETIME,
    "assignedOfficerId" TEXT,
    CONSTRAINT "loan_applications_assignedOfficerId_fkey" FOREIGN KEY ("assignedOfficerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "applicationId" TEXT NOT NULL,
    CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "loan_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" TEXT NOT NULL,
    CONSTRAINT "loan_notes_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "status_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "reason" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    CONSTRAINT "status_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "loan_applications_applicationNo_key" ON "loan_applications"("applicationNo");

-- CreateIndex
CREATE INDEX "loan_applications_status_idx" ON "loan_applications"("status");

-- CreateIndex
CREATE INDEX "loan_applications_borrowerEmail_idx" ON "loan_applications"("borrowerEmail");

-- CreateIndex
CREATE INDEX "loan_applications_assignedOfficerId_idx" ON "loan_applications"("assignedOfficerId");

-- CreateIndex
CREATE INDEX "loan_applications_submittedAt_idx" ON "loan_applications"("submittedAt");
