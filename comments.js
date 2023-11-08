// Create web server

var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');
var jwt = require('jsonwebtoken');
var config = require('../config');
var mongoose = require('mongoose');
var db = mongoose.connection;
var ObjectId = mongoose.Types.ObjectId;
var Post = require('../models/post');

// Get all comments
router.get('/', function(req, res) {
    Comment.find(function(err, comments) {
        if (err) {
            res.send(err);
        }
        res.json(comments);
    });
});

// Get comments by post id
router.get('/:post_id', function(req, res) {
    var post_id = req.params.post_id;
    Comment.find({post_id: post_id}, function(err, comments) {
        if (err) {
            res.send(err);
        }
        res.json(comments);
    });
});

// Create comment
router.post('/', function(req, res) {
    var token = req.body.token;
    var post_id = req.body.post_id;
    var content = req.body.content;

    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                var user_id = decoded._id;
                var comment = new Comment({
                    user_id: user_id,
                    post_id: post_id,
                    content: content
                });
                comment.save(function(err) {
                    if (err) {
                        res.send(err);
                    }
                    res.json({success: true, message: 'Comment created successfully.'});
                });
            }
        });
    } else {
        res.status(403).send({success: false, message: 'No token provided.'});
    }
});

// Delete comment
router.delete('/:comment_id', function(req, res) {
    var token = req.body.token;
    var comment_id = req.params.comment_id;

    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                var user_id = decoded._id;
                Comment.findById(comment_id, function(err, comment) {
                    if (err) {
                        res.send(err);
                    }
                    if (comment.user_id == user_id) {
                        Comment.remove({_id: