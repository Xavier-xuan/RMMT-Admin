# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV NUXT_API_URL=https://rmmt-api.default.svc.cluster.local

# 构建静态文件
RUN yarn generate

# 生产阶段 - 使用nginx服务静态文件
FROM nginx:alpine

# 复制构建的静态文件到nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]