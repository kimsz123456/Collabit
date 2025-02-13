package com.collabit.global.service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RequiredArgsConstructor
@Service
public class S3Service {

    private final AmazonS3 amazonS3;
    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.s3.base-url}")
    private String baseUrl;


    public String upload(MultipartFile file, String dirName) {
        if (file.isEmpty()) {
            return null;
        }
        String fileName = dirName + "/" + UUID.randomUUID();
        try (InputStream inputStream = file.getInputStream()) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            amazonS3.putObject(new PutObjectRequest(bucket, fileName, inputStream, metadata));
        } catch (IOException e) {
            log.error(e.getMessage());
        }
        return amazonS3.getUrl(bucket, fileName).toString();
    }

    public boolean delete(String fileUrl) {
        try {
            amazonS3.deleteObject(new DeleteObjectRequest(bucket, baseUrl + fileUrl));
            return true;
        } catch (AmazonServiceException e) {
            log.error(e.getMessage());
        } catch (SdkClientException e) {
            log.error(e.getMessage());
        }
        return false;
    }
}