package com.collabit.project.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int code;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String organization;

    @Column(name = "organization_image", nullable = false)
    private String organizationImage;

    @OneToMany(mappedBy = "project")
    private List<ProjectInfo> projectInfos;

    @OneToMany(mappedBy = "project")
    private List<ProjectContributor> projectContributors;

    public void updateOrganizationImage(String newImage) {
        this.organizationImage = newImage;
    }
}
