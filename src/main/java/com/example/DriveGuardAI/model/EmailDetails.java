package com.example.DriveGuardAI.model;

public class EmailDetails {
    
    private String recipient;
    private String msgBody;
    private String subject;

    // No-args constructor
    public EmailDetails() {
    }

    // All-args constructor
    public EmailDetails(String recipient, String msgBody, String subject) {
        this.recipient = recipient;
        this.msgBody = msgBody;
        this.subject = subject;
    }

    // Getter and Setter for recipient
    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    // Getter and Setter for msgBody
    public String getMsgBody() {
        return msgBody;
    }

    public void setMsgBody(String msgBody) {
        this.msgBody = msgBody;
    }

    // Getter and Setter for subject
    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }
}