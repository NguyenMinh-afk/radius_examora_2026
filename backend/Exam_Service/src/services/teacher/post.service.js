/**
 * Teacher Post Service - Class Posts Management
 */
import axios from 'axios';
import { Op } from 'sequelize';
import {
  Class,
  ClassMember,
  ClassPost,
  User
} from '../../models/index.js';

class PostService {

  async getClassPosts(teacherId, classId, filters = {}) {
    const cls = await Class.findOne({
      where: { id: classId, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error('Class not found or access denied');
    }

    const { type, search, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const whereClause = { class_id: classId };
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: posts } = await ClassPost.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'author', attributes: ['full_name', 'avatar_url'] }
      ],
      order: [
        ['is_pinned', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit,
      offset
    });

    const items = posts.map(p => ({
      postId: p.id,
      title: p.title,
      content: p.content,
      type: p.type,
      isPinned: p.is_pinned,
      attachments: p.attachments || [],
      authorName: p.author?.full_name || 'Unknown',
      authorAvatar: p.author?.avatar_url || null,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return {
      items,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  async createClassPost(teacherId, classId, data) {
    const cls = await Class.findOne({
      where: { id: classId, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error('Class not found or access denied');
    }

    const { title, content, type = 'announcement', isPinned = false, attachments = [] } = data;

    if (!content || content.trim() === '') {
      throw new Error('Nội dung không được để trống');
    }

    const post = await ClassPost.create({
      class_id: classId,
      author_id: teacherId,
      title: title || null,
      content: content.trim(),
      type,
      is_pinned: isPinned,
      attachments
    });

    await this.notifyStudents(classId, post);

    return {
      postId: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      isPinned: post.is_pinned,
      attachments: post.attachments,
      createdAt: post.created_at
    };
  }

  async updateClassPost(teacherId, postId, data) {
    const post = await ClassPost.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const cls = await Class.findOne({
      where: { id: post.class_id, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error('Access denied');
    }

    const { title, content, type, isPinned, attachments } = data;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (type !== undefined) post.type = type;
    if (isPinned !== undefined) post.is_pinned = isPinned;
    if (attachments !== undefined) post.attachments = attachments;

    await post.save();

    return {
      postId: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      isPinned: post.is_pinned,
      attachments: post.attachments,
      updatedAt: post.updated_at
    };
  }

  async deleteClassPost(teacherId, postId) {
    const post = await ClassPost.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const cls = await Class.findOne({
      where: { id: post.class_id, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error('Access denied');
    }

    await post.destroy();
    return { success: true };
  }

  async notifyStudents(classId, post) {
    try {
      const members = await ClassMember.findAll({
        where: { class_id: classId, role: 'student' },
        include: [{ model: User, as: 'user', attributes: ['id', 'email'] }]
      });

      if (members.length === 0) return;

      const classInfo = await Class.findByPk(classId, { attributes: ['name'] });
      const notificationPayloads = members.map(m => ({
        user_id: m.user_id,
        type: 'class_post',
        title: `Thông báo mới từ lớp ${classInfo?.name || 'N/A'}`,
        content: post.title || post.content.substring(0, 100),
        metadata: {
          classId,
          postId: post.id,
          postType: post.type,
        }
      }));

      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
      await Promise.all(
        notificationPayloads.map(payload =>
          axios.post(`${notificationUrl}/api/notifications/internal`, payload)
            .catch(error => {
              console.error('[ClassPost] Failed to send notification:', error.message);
            })
        )
      );

      return notificationPayloads;
    } catch (error) {
      console.error('[ClassPost] Failed to notify students:', error);
    }
  }
}

export default new PostService();
